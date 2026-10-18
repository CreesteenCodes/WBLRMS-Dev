/**
 * Supabase data layer for WBLRMS.
 *
 * Replaces the legacy SQLite JSON-blob storage (src/lib/local-database.ts) with
 * the normalized Postgres schema that already exists in the Supabase project
 * (see docs/SUPABASE-DB-ANALYSIS.md). The functions below translate between the
 * flat camelCase record shapes the frontend expects and the relational tables.
 */
import { randomUUID } from 'crypto';
import { getAdminClient, STORAGE_BUCKET } from '@/lib/supabase';

export type StoredRecord = Record<string, unknown> & { id: string };

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/* ----------------------------- shared helpers ----------------------------- */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).trim();
}

function dateOrNull(value: unknown): string | null {
  const s = str(value);
  return s ? s : null;
}

function numOrNull(value: unknown): number | null {
  const s = str(value).replace(/[, ]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function capitalize(value: unknown): string {
  const s = str(value);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/* role mapping: DB enum <-> frontend display names */
const ROLE_TO_DISPLAY: Record<string, string> = {
  head_engineer: 'Head Engineer',
  encoder: 'Staff - Encoder',
  inspector: 'Staff - Inspector',
  validator: 'Staff - Validator',
};

export function roleToDisplay(role: unknown): string {
  return ROLE_TO_DISPLAY[str(role)] ?? capitalize(role);
}

/* condition mapping: frontend 'Good'/'Fair'/'Poor'/'Bad' <-> enum lowercase */
function conditionToDb(value: unknown): string | null {
  const s = str(value).toLowerCase();
  return ['good', 'fair', 'poor', 'bad'].includes(s) ? s : null;
}

function maintenanceTypeToDb(value: unknown): string {
  const s = str(value).toLowerCase();
  if (s.includes('prevent')) return 'preventive';
  if (s.includes('routine')) return 'routine';
  if (s.includes('emergen')) return 'emergency';
  return 'corrective';
}

const MAINTENANCE_TYPE_TO_DISPLAY: Record<string, string> = {
  corrective: 'Corrective Maintenance',
  preventive: 'Preventive Maintenance',
  routine: 'Routine Maintenance',
  emergency: 'Emergency Maintenance',
};

const MAINTENANCE_STATUS_TO_DISPLAY: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function maintenanceStatusToDb(value: unknown): string {
  const s = str(value).toLowerCase();
  if (s.includes('progress')) return 'in_progress';
  if (s.includes('complete')) return 'completed';
  return 'scheduled';
}

function inspectionTypeToDb(value: unknown): string {
  const s = str(value).toLowerCase();
  if (s.includes('accept')) return 'type_acceptance';
  if (s.includes('follow')) return 'follow_up';
  if (s.includes('initial')) return 'initial';
  return 'routine';
}

const INSPECTION_TYPE_TO_DISPLAY: Record<string, string> = {
  type_acceptance: 'Acceptance',
  routine: 'Routine',
  follow_up: 'Follow-up',
  initial: 'Initial',
};

function scoreToCondition(score: number): string {
  if (score >= 8) return 'good';
  if (score >= 5) return 'fair';
  if (score >= 3) return 'poor';
  return 'bad';
}

/* ------------------------- lookup/reference helpers ------------------------ */

async function ensureBarangayId(name: unknown): Promise<number> {
  const db = getAdminClient();
  const target = str(name) || 'Unspecified';

  const { data: existing, error: findError } = await db
    .from('barangays')
    .select('id, name')
    .ilike('name', target)
    .limit(1);
  if (findError) throw new Error(`barangays lookup failed: ${findError.message}`);
  if (existing && existing.length > 0) return existing[0].id as number;

  const { data: maxRow } = await db
    .from('barangays')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);
  const nextId = ((maxRow?.[0]?.id as number) ?? 0) + 1;

  const { data: inserted, error: insertError } = await db
    .from('barangays')
    .insert({ id: nextId, name: target })
    .select('id')
    .single();
  if (insertError) throw new Error(`barangays insert failed: ${insertError.message}`);
  return inserted.id as number;
}

async function resolveCategory(name: unknown): Promise<{ category_id: number | null; category_other: string | null }> {
  const db = getAdminClient();
  const target = str(name);
  if (!target) return { category_id: null, category_other: null };

  const { data } = await db.from('project_categories').select('id, name').ilike('name', `%${target}%`).limit(1);
  if (data && data.length > 0) return { category_id: data[0].id as number, category_other: null };

  // try reverse containment, e.g. form sends "Municipal Road" and category is "Municipal"
  const { data: all } = await db.from('project_categories').select('id, name');
  const match = (all ?? []).find(
    (c) => target.toLowerCase().includes(String(c.name).toLowerCase()) || String(c.name).toLowerCase().includes(target.toLowerCase())
  );
  if (match) return { category_id: match.id as number, category_other: null };
  return { category_id: null, category_other: target };
}

async function ensureContractorId(record: Record<string, unknown>): Promise<string | null> {
  const db = getAdminClient();
  const name = str(record.contractorName ?? record.contractor);
  if (!name) return null;

  const fields = {
    address: str(record.contractorAddress) || null,
    contact_information: str(record.contactInformation) || null,
    pcab_license_no: str(record.pcadLicenseNo ?? record.pcabLicenseNo) || null,
  };

  const { data: existing } = await db.from('contractors').select('id').ilike('name', name).limit(1);
  if (existing && existing.length > 0) {
    const id = existing[0].id as string;
    await db.from('contractors').update(fields).eq('id', id);
    return id;
  }

  const { data: inserted, error } = await db
    .from('contractors')
    .insert({ name, ...fields })
    .select('id')
    .single();
  if (error) throw new Error(`contractors insert failed: ${error.message}`);
  return inserted.id as string;
}

async function findProfileIdByName(name: unknown): Promise<string | null> {
  const target = str(name);
  if (!target) return null;
  const db = getAdminClient();
  const { data } = await db
    .from('profiles')
    .select('id')
    .or(`full_name.ilike.${target},username.ilike.${target},email.ilike.${target}`)
    .limit(1);
  return data && data.length > 0 ? (data[0].id as string) : null;
}

function deriveProjectStatus(record: Record<string, unknown>): string {
  if (str(record.turnoverDate)) return 'turned_over';
  const pct = numOrNull(record.completionPercentage);
  if (str(record.actualCompletionDate) || (pct !== null && pct >= 100)) return 'completed';
  if (pct !== null && pct > 0) return 'on_track';
  return 'planned';
}

/* ------------------------------- attachments ------------------------------- */

type FrontendAttachment = { name: string; type: string; dataUrl: string; category: string };

function attachmentCategoryToDb(category: unknown): string {
  const s = str(category).toLowerCase();
  if (s.includes('turnover')) return 'turnover_certificate';
  if (s.includes('inspect')) return 'inspection_photo';
  if (s.includes('mainten')) return 'maintenance_document';
  return 'project_attachment';
}

const ATTACHMENT_CATEGORY_TO_DISPLAY: Record<string, string> = {
  turnover_certificate: 'Turnover Certificate',
  inspection_photo: 'Inspection Photo',
  maintenance_document: 'Maintenance Document',
  project_attachment: 'Project Attachment',
};

async function syncProjectAttachments(projectId: string, submitted: FrontendAttachment[]): Promise<void> {
  const db = getAdminClient();
  const { data: existingRows } = await db
    .from('attachments')
    .select('id, file_name, storage_path')
    .eq('project_id', projectId);
  const existing = existingRows ?? [];

  const submittedNames = new Set(submitted.map((a) => str(a.name)));

  // remove attachments no longer present in the submitted list
  const toRemove = existing.filter((row) => !submittedNames.has(str(row.file_name)));
  if (toRemove.length > 0) {
    await db.storage.from(STORAGE_BUCKET).remove(toRemove.map((row) => row.storage_path as string));
    await db.from('attachments').delete().in('id', toRemove.map((row) => row.id as string));
  }

  // upload any newly added files (dataUrl starts with "data:")
  const existingNames = new Set(existing.map((row) => str(row.file_name)));
  for (const attachment of submitted) {
    const name = str(attachment.name);
    const dataUrl = str(attachment.dataUrl);
    if (!dataUrl.startsWith('data:') || existingNames.has(name)) continue;

    const comma = dataUrl.indexOf(',');
    if (comma < 0) continue;
    const header = dataUrl.slice(0, comma);
    const mime = str(attachment.type) || header.replace(/^data:/, '').replace(/;base64$/, '') || 'application/octet-stream';
    const buffer = Buffer.from(dataUrl.slice(comma + 1), 'base64');

    const safeName = name.replace(/[^A-Za-z0-9._-]/g, '_') || 'attachment';
    const storagePath = `projects/${projectId}/${randomUUID()}-${safeName}`;

    const { error: uploadError } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: false });
    if (uploadError) throw new Error(`attachment upload failed: ${uploadError.message}`);

    const { error: insertError } = await db.from('attachments').insert({
      project_id: projectId,
      category: attachmentCategoryToDb(attachment.category),
      file_name: name,
      storage_path: storagePath,
      mime_type: mime,
      file_size: buffer.length,
    });
    if (insertError) throw new Error(`attachment insert failed: ${insertError.message}`);
  }
}

async function loadAttachmentsByProject(projectIds: string[]): Promise<Map<string, FrontendAttachment[]>> {
  const result = new Map<string, FrontendAttachment[]>();
  if (projectIds.length === 0) return result;

  const db = getAdminClient();
  const { data: rows } = await db
    .from('attachments')
    .select('project_id, category, file_name, storage_path, mime_type')
    .in('project_id', projectIds);
  const attachments = rows ?? [];
  if (attachments.length === 0) return result;

  const { data: signed } = await db.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(attachments.map((row) => row.storage_path as string), SIGNED_URL_TTL_SECONDS);

  attachments.forEach((row, index) => {
    const url = signed?.[index]?.signedUrl ?? '';
    const list = result.get(row.project_id as string) ?? [];
    list.push({
      name: str(row.file_name),
      type: str(row.mime_type),
      dataUrl: url,
      category: ATTACHMENT_CATEGORY_TO_DISPLAY[str(row.category)] ?? 'Project Attachment',
    });
    result.set(row.project_id as string, list);
  });
  return result;
}

/* --------------------------------- roads ---------------------------------- */

const PROJECT_SELECT = `
  *,
  road:roads ( *, barangay:barangays ( name ) ),
  category:project_categories ( name ),
  contractor:contractors ( * )
`;

function flattenProject(p: any, attachments: FrontendAttachment[]): StoredRecord {
  const road = p.road ?? {};
  const barangayName = str(road.barangay?.name);
  const categoryName = str(p.category?.name) || str(p.category_other);
  const contractor = p.contractor ?? {};

  return {
    id: p.id,
    name: str(p.project_name) || str(road.road_name),
    type: categoryName,
    location: barangayName,
    dateBuilt: str(road.date_built ?? p.date_started),
    condition: capitalize(road.current_condition) || 'Good',
    lastInspection: road.last_inspection_date ?? undefined,
    projectName: str(p.project_name),
    projectCategory: categoryName,
    projectDescription: str(p.description),
    dateStarted: str(p.date_started),
    targetCompletionDate: str(p.target_completion_date),
    noOfExtensions: p.extensions_count != null ? String(p.extensions_count) : '',
    actualCompletionDate: str(p.actual_completion_date),
    roadNetworkId: str(road.road_network_id),
    roadName: str(road.road_name),
    barangay: barangayName,
    components: str(road.components),
    description: str(road.description),
    contractorName: str(contractor.name),
    contractorAddress: str(contractor.address),
    contactInformation: str(contractor.contact_information),
    pcadLicenseNo: str(contractor.pcab_license_no),
    sourceOfFunds: str(p.source_of_funds),
    appropriation: p.appropriation != null ? String(p.appropriation) : '',
    contractedAmount: p.contracted_amount != null ? String(p.contracted_amount) : '',
    adjustProjectCost: p.adjusted_project_cost != null ? String(p.adjusted_project_cost) : '',
    completionDate: str(p.completion_date),
    completionPercentage: p.completion_percentage != null ? String(p.completion_percentage) : '',
    turnoverDate: str(p.turnover_date),
    attachments,
    validationResult:
      p.validation_status === 'approved' ? 'Validated' : p.validation_status === 'rejected' ? 'Return for Revision' : undefined,
    validationRemarks: p.validation_remarks ?? undefined,
  };
}

export async function listRoads(): Promise<StoredRecord[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('projects')
    .select(PROJECT_SELECT)
    .is('archived_at', null)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`projects query failed: ${error.message}`);

  const projects = data ?? [];
  const attachmentsByProject = await loadAttachmentsByProject(projects.map((p: any) => p.id as string));
  return projects.map((p: any) => flattenProject(p, attachmentsByProject.get(p.id as string) ?? []));
}

export async function getRoad(id: string): Promise<StoredRecord | undefined> {
  if (!isUuid(id)) return undefined;
  const db = getAdminClient();
  const { data } = await db.from('projects').select(PROJECT_SELECT).eq('id', id).maybeSingle();
  if (!data) return undefined;
  const attachmentsByProject = await loadAttachmentsByProject([id]);
  return flattenProject(data, attachmentsByProject.get(id) ?? []);
}

export async function saveRoad(record: StoredRecord): Promise<StoredRecord> {
  const db = getAdminClient();
  const id = isUuid(record.id) ? record.id : randomUUID();

  const { data: existingProject } = await db
    .from('projects')
    .select('id, road_id, contractor_id')
    .eq('id', id)
    .maybeSingle();

  /* --- road row --- */
  const barangayId = await ensureBarangayId(record.barangay ?? record.location);
  const roadFields = {
    road_name: str(record.roadName) || str(record.location) || str(record.name) || 'Unnamed Road',
    road_network_id: str(record.roadNetworkId) || null,
    barangay_id: barangayId,
    components: str(record.components) || null,
    description: str(record.description) || null,
    date_built: dateOrNull(record.dateBuilt ?? record.dateStarted),
    current_condition: conditionToDb(record.condition),
    last_inspection_date: dateOrNull(record.lastInspection),
  };

  let roadId: string;
  if (existingProject?.road_id) {
    roadId = existingProject.road_id as string;
    const { error } = await db.from('roads').update(roadFields).eq('id', roadId);
    if (error) throw new Error(`road update failed: ${error.message}`);
  } else {
    // reuse an existing road when the unique road_network_id matches
    let reuse: string | null = null;
    if (roadFields.road_network_id) {
      const { data: match } = await db
        .from('roads')
        .select('id')
        .eq('road_network_id', roadFields.road_network_id)
        .maybeSingle();
      reuse = (match?.id as string) ?? null;
    }
    if (reuse) {
      roadId = reuse;
      const { error } = await db.from('roads').update(roadFields).eq('id', roadId);
      if (error) throw new Error(`road update failed: ${error.message}`);
    } else {
      const { data: inserted, error } = await db.from('roads').insert(roadFields).select('id').single();
      if (error) throw new Error(`road insert failed: ${error.message}`);
      roadId = inserted.id as string;
    }
  }

  /* --- project row --- */
  const { category_id, category_other } = await resolveCategory(record.projectCategory ?? record.type);
  const contractorId = await ensureContractorId(record);

  const validationStatus =
    record.validationResult === 'Validated'
      ? 'approved'
      : record.validationResult === 'Return for Revision'
        ? 'rejected'
        : 'pending';

  const projectFields: Record<string, unknown> = {
    project_name: str(record.projectName) || str(record.name) || roadFields.road_name,
    road_id: roadId,
    category_id,
    category_other,
    description: str(record.projectDescription) || null,
    barangay_id: barangayId,
    date_started: dateOrNull(record.dateStarted ?? record.dateBuilt),
    target_completion_date: dateOrNull(record.targetCompletionDate),
    extensions_count: numOrNull(record.noOfExtensions) ?? 0,
    actual_completion_date: dateOrNull(record.actualCompletionDate),
    status: deriveProjectStatus(record),
    contractor_id: contractorId,
    source_of_funds: str(record.sourceOfFunds) || null,
    appropriation: numOrNull(record.appropriation),
    contracted_amount: numOrNull(record.contractedAmount),
    adjusted_project_cost: numOrNull(record.adjustProjectCost),
    completion_date: dateOrNull(record.completionDate),
    completion_percentage: Math.min(100, Math.max(0, numOrNull(record.completionPercentage) ?? 0)),
    turnover_date: dateOrNull(record.turnoverDate),
    validation_status: validationStatus,
    validation_remarks: str(record.validationRemarks) || null,
    validated_at: validationStatus === 'pending' ? null : new Date().toISOString(),
  };

  if (existingProject) {
    const { error } = await db.from('projects').update(projectFields).eq('id', id);
    if (error) throw new Error(`project update failed: ${error.message}`);
  } else {
    const { error } = await db.from('projects').insert({ id, ...projectFields });
    if (error) throw new Error(`project insert failed: ${error.message}`);
  }

  /* --- attachments --- */
  const submitted = Array.isArray(record.attachments) ? (record.attachments as FrontendAttachment[]) : [];
  await syncProjectAttachments(id, submitted);

  return (await getRoad(id)) ?? { ...record, id };
}

export async function deleteRoad(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const db = getAdminClient();

  const { data: project } = await db.from('projects').select('id, road_id').eq('id', id).maybeSingle();
  if (!project) return false;

  // remove stored files first (DB rows cascade with the project)
  const { data: attachmentRows } = await db.from('attachments').select('storage_path').eq('project_id', id);
  if (attachmentRows && attachmentRows.length > 0) {
    await db.storage.from(STORAGE_BUCKET).remove(attachmentRows.map((row) => row.storage_path as string));
  }

  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw new Error(`project delete failed: ${error.message}`);

  // delete the road too when no other project references it (FK is RESTRICT)
  if (project.road_id) {
    await db.from('roads').delete().eq('id', project.road_id);
  }
  return true;
}

/* ------------------------------- inspections ------------------------------- */

export async function listInspections(): Promise<StoredRecord[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('inspections')
    .select('*, project:projects ( project_name ), inspector:profiles!inspections_inspector_id_fkey ( full_name )')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`inspections query failed: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    localRoadId: row.project_id,
    localRoadName: str(row.project?.project_name),
    date: str(row.inspection_date),
    inspectionType: INSPECTION_TYPE_TO_DISPLAY[str(row.inspection_type)] ?? capitalize(row.inspection_type),
    conditionRating: row.overall_score != null ? Number(row.overall_score) : 0,
    inspector: str(row.inspector?.full_name),
    remarks: str(row.remarks),
    validationStatus: capitalize(row.validation_status),
  }));
}

export async function saveInspection(record: StoredRecord, projectId: string): Promise<StoredRecord> {
  const db = getAdminClient();
  const score = numOrNull(record.conditionRating) ?? 0;
  const inspectorId = await findProfileIdByName(record.inspector);

  const { data: inserted, error } = await db
    .from('inspections')
    .insert({
      project_id: projectId,
      inspection_date: dateOrNull(record.date) ?? new Date().toISOString().slice(0, 10),
      inspection_type: inspectionTypeToDb(record.inspectionType),
      inspector_id: inspectorId,
      overall_score: score,
      overall_condition: scoreToCondition(score),
      remarks: str(record.remarks) || null,
    })
    .select('id')
    .single();
  if (error) throw new Error(`inspection insert failed: ${error.message}`);

  return { ...record, id: inserted.id as string };
}

/* ------------------------------- maintenance ------------------------------- */

export async function listMaintenanceRecords(): Promise<StoredRecord[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('maintenance_records')
    .select('*, project:projects ( project_name ), contractor:contractors ( name )')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`maintenance query failed: ${error.message}`);

  return (data ?? []).map((row: any) => {
    const typeDisplay = MAINTENANCE_TYPE_TO_DISPLAY[str(row.maintenance_type)] ?? capitalize(row.maintenance_type);
    return {
      id: row.id,
      localRoadId: row.project_id,
      localRoadName: str(row.project?.project_name),
      maintenanceType: typeDisplay,
      type: typeDisplay,
      maintenanceActivities: str(row.activities),
      description: str(row.activities),
      remarks: str(row.remarks),
      contractor: str(row.contractor?.name),
      scheduledDate: str(row.scheduled_date),
      completedDate: row.completed_date ?? undefined,
      cost: row.cost != null ? Number(row.cost) : 0,
      status: MAINTENANCE_STATUS_TO_DISPLAY[str(row.status)] ?? 'Scheduled',
    };
  });
}

export async function saveMaintenanceRecord(record: StoredRecord, projectId: string): Promise<StoredRecord> {
  const db = getAdminClient();
  const contractorId = await ensureContractorId(record);

  const fields = {
    project_id: projectId,
    contractor_id: contractorId,
    maintenance_type: maintenanceTypeToDb(record.maintenanceType ?? record.type),
    activities: str(record.maintenanceActivities ?? record.description) || null,
    remarks: str(record.remarks) || null,
    scheduled_date: dateOrNull(record.scheduledDate) ?? new Date().toISOString().slice(0, 10),
    completed_date: dateOrNull(record.completedDate),
    cost: numOrNull(record.cost) ?? 0,
    status: maintenanceStatusToDb(record.status),
  };

  if (isUuid(record.id)) {
    const { data: existing } = await db.from('maintenance_records').select('id').eq('id', record.id).maybeSingle();
    if (existing) {
      const { error } = await db.from('maintenance_records').update(fields).eq('id', record.id);
      if (error) throw new Error(`maintenance update failed: ${error.message}`);
      return record;
    }
  }

  const { data: inserted, error } = await db.from('maintenance_records').insert(fields).select('id').single();
  if (error) throw new Error(`maintenance insert failed: ${error.message}`);
  return { ...record, id: inserted.id as string };
}

/* ---------------------------------- users ---------------------------------- */

export type LocalUser = {
  userId: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: 'Active' | 'Inactive';
};

export async function listLocalUsers(): Promise<LocalUser[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email, username, role, status')
    .order('employee_id', { ascending: true });
  if (error) throw new Error(`profiles query failed: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    userId: row.id as string,
    name: str(row.full_name),
    email: str(row.email),
    username: str(row.username),
    role: roleToDisplay(row.role),
    status: str(row.status) === 'inactive' ? 'Inactive' : 'Active',
  }));
}

export async function updateLocalUserStatus(email: string, status: 'Active' | 'Inactive'): Promise<boolean> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('profiles')
    .update({ status: status === 'Active' ? 'active' : 'inactive' })
    .ilike('email', email)
    .select('id');
  if (error) throw new Error(`profile update failed: ${error.message}`);
  return (data ?? []).length > 0;
}

export async function findProfileByIdentifier(identifier: string): Promise<
  { id: string; email: string; name: string; role: string; roleKey: string; status: string } | null
> {
  const db = getAdminClient();
  const target = identifier.trim();
  const { data } = await db
    .from('profiles')
    .select('id, full_name, email, username, role, status')
    .or(`username.ilike.${target},email.ilike.${target}`)
    .limit(1);
  if (!data || data.length === 0) return null;
  const row: any = data[0];
  return {
    id: row.id as string,
    email: str(row.email),
    name: str(row.full_name),
    role: roleToDisplay(row.role),
    roleKey: str(row.role),
    status: str(row.status),
  };
}

/* --------------------------- lockout / master code -------------------------- */

export const MAX_ATTEMPTS = 3;

export async function getLockState(identifier: string): Promise<{ locked: boolean; retryAfterSeconds: number }> {
  const db = getAdminClient();
  const { data, error } = await db.rpc('is_login_locked', { p_identifier: identifier });
  if (error) throw new Error(`is_login_locked failed: ${error.message}`);
  const row: any = Array.isArray(data) ? data[0] : data;
  return { locked: Boolean(row?.locked), retryAfterSeconds: Number(row?.retry_after_seconds ?? 0) };
}

export async function registerFailedLogin(identifier: string): Promise<{ failedCount: number; lockedUntil: string | null }> {
  const db = getAdminClient();
  const { data, error } = await db.rpc('register_failed_login', {
    p_identifier: identifier,
    p_max_attempts: MAX_ATTEMPTS,
    p_lock_minutes: 15,
  });
  if (error) throw new Error(`register_failed_login failed: ${error.message}`);
  const row: any = Array.isArray(data) ? data[0] : data;
  return { failedCount: Number(row?.failed_count ?? 0), lockedUntil: row?.locked_until ?? null };
}

export async function registerSuccessfulLogin(identifier: string): Promise<void> {
  const db = getAdminClient();
  await db.rpc('register_successful_login', { p_identifier: identifier });
}

export async function unlockAccount(identifier: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.rpc('unlock_account', { p_identifier: identifier });
  if (error) throw new Error(`unlock_account failed: ${error.message}`);
}

export async function listLockedIdentifiers(): Promise<Record<string, number>> {
  const db = getAdminClient();
  const { data } = await db
    .from('login_attempts')
    .select('identifier, locked_until')
    .gt('locked_until', new Date().toISOString());
  const locked: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    const seconds = Math.max(0, Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1000));
    locked[str(row.identifier)] = seconds;
  });
  return locked;
}

async function masterCodeHashExists(): Promise<boolean> {
  const db = getAdminClient();
  const { data } = await db.from('system_settings').select('key').eq('key', 'master_unlock_code_hash').maybeSingle();
  return Boolean(data);
}

function fallbackMasterCode(): string {
  return process.env.ADMIN_UNLOCK_CODE?.trim() || 'master123';
}

export async function verifyMasterCode(code: string): Promise<boolean> {
  if (await masterCodeHashExists()) {
    const db = getAdminClient();
    const { data, error } = await db.rpc('verify_master_code', { p_code: code });
    if (error) throw new Error(`verify_master_code failed: ${error.message}`);
    return Boolean(data);
  }
  // no code stored in the database yet — fall back to env/default (legacy behavior)
  return code === fallbackMasterCode();
}

export async function setMasterCode(newCode: string, currentCode: string): Promise<{ ok: boolean; message?: string }> {
  const db = getAdminClient();
  const hashExists = await masterCodeHashExists();
  if (!hashExists && currentCode !== fallbackMasterCode()) {
    return { ok: false, message: 'Current master password is incorrect.' };
  }
  const { error } = await db.rpc('set_master_code', {
    p_new: newCode,
    p_current: hashExists ? currentCode : null,
  });
  if (error) {
    const message = error.message.includes('incorrect')
      ? 'Current master password is incorrect.'
      : error.message;
    return { ok: false, message };
  }
  return { ok: true };
}
