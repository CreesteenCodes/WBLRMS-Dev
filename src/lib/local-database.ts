import Database from 'better-sqlite3';
import { randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import { DEMO_LOCAL_ROADS, DEMO_USERS, type DemoUser } from '@/lib/demo-data';

export type StoredRecord = Record<string, unknown> & { id: string };
export type LocalUser = Omit<DemoUser, 'password'> & { status: 'Active' | 'Inactive' };

const databasePath = path.join(process.cwd(), 'data', 'local-road.sqlite');
const legacyUsersPath = path.join(process.cwd(), 'data', 'demo-users.json');

let database: Database.Database | undefined;

function getDatabase(): Database.Database {
  if (database) return database;

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS roads (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      road_id TEXT NOT NULL REFERENCES roads(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS maintenance_records (
      id TEXT PRIMARY KEY,
      road_id TEXT NOT NULL REFERENCES roads(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedRoads(database);
  seedUsers(database);
  return database;
}

function seedRoads(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM roads').get() as { count: number };
  if (count.count > 0) return;

  const insert = db.prepare('INSERT INTO roads (id, data) VALUES (?, ?)');
  const seed = db.transaction(() => {
    DEMO_LOCAL_ROADS.forEach((road) => insert.run(road.id, JSON.stringify(road)));
  });
  seed();
}

function readLegacyUsers(): DemoUser[] {
  if (!fs.existsSync(legacyUsersPath)) return DEMO_USERS;
  const parsed: unknown = JSON.parse(fs.readFileSync(legacyUsersPath, 'utf8'));
  if (
    !Array.isArray(parsed) ||
    parsed.some((user) =>
      !user ||
      typeof user.userId !== 'string' ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.username !== 'string' ||
      typeof user.password !== 'string' ||
      typeof user.role !== 'string'
    )
  ) {
    throw new Error('The existing local user data file is invalid.');
  }
  return parsed as DemoUser[];
}

function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function seedUsers(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (count.count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (id, name, email, username, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const seed = db.transaction(() => {
    readLegacyUsers().forEach((user) => {
      insert.run(
        user.userId,
        user.name,
        user.email.toLowerCase(),
        user.username,
        hashPassword(user.password),
        user.role,
        user.status ?? 'Active'
      );
    });
  });
  seed();
}

function readRecords(table: 'roads' | 'inspections' | 'maintenance_records'): StoredRecord[] {
  const rows = getDatabase()
    .prepare(`SELECT data FROM ${table} ORDER BY created_at DESC, rowid DESC`)
    .all() as Array<{ data: string }>;
  return rows.map((row) => JSON.parse(row.data) as StoredRecord);
}

function saveRecord(
  table: 'roads' | 'inspections' | 'maintenance_records',
  record: StoredRecord,
  roadId?: string
): void {
  const db = getDatabase();
  if (table === 'roads') {
    db.prepare(`
      INSERT INTO roads (id, data) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data
    `).run(record.id, JSON.stringify(record));
    return;
  }

  if (!roadId) throw new Error('A road ID is required for this record.');
  db.prepare(`
    INSERT INTO ${table} (id, road_id, data) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET road_id = excluded.road_id, data = excluded.data
  `).run(record.id, roadId, JSON.stringify(record));
}

export function listRoads(): StoredRecord[] {
  return readRecords('roads');
}

export function saveRoad(record: StoredRecord): void {
  saveRecord('roads', record);
}

export function deleteRoad(id: string): boolean {
  return getDatabase().prepare('DELETE FROM roads WHERE id = ?').run(id).changes > 0;
}

export function listInspections(): StoredRecord[] {
  return readRecords('inspections');
}

export function saveInspection(record: StoredRecord, roadId: string): void {
  saveRecord('inspections', record, roadId);
}

export function listMaintenanceRecords(): StoredRecord[] {
  return readRecords('maintenance_records');
}

export function saveMaintenanceRecord(record: StoredRecord, roadId: string): void {
  saveRecord('maintenance_records', record, roadId);
}

export function findLocalUser(identifier: string): (LocalUser & { passwordHash: string }) | undefined {
  const normalized = identifier.trim().toLowerCase();
  const row = getDatabase().prepare(`
    SELECT id, name, email, username, role, status, password_hash AS passwordHash
    FROM users
    WHERE lower(username) = ? OR lower(email) = ?
  `).get(normalized, normalized) as
    | (Omit<DemoUser, 'password' | 'userId'> & { id: string; passwordHash: string; status: string })
    | undefined;
  if (!row) return undefined;
  return {
    userId: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: row.role as DemoUser['role'],
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
    passwordHash: row.passwordHash,
  };
}

export function authenticateLocalUser(
  identifier: string,
  password: string
): LocalUser | undefined {
  const user = findLocalUser(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) return undefined;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function listLocalUsers(): LocalUser[] {
  const rows = getDatabase().prepare(`
    SELECT id, name, email, username, role, status
    FROM users
    ORDER BY created_at, rowid
  `).all() as Array<{
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
  }>;
  return rows.map((row) => ({
    userId: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    role: row.role as DemoUser['role'],
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
  }));
}

export function updateLocalUserStatus(email: string, status: 'Active' | 'Inactive'): boolean {
  return getDatabase()
    .prepare('UPDATE users SET status = ? WHERE lower(email) = ?')
    .run(status, email.trim().toLowerCase()).changes > 0;
}
