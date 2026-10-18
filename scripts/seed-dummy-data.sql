-- ============================================================================
-- WBLRMS Dummy Data Seed Script
-- Project: WBLRMS (Supabase ref: jowcyoziuqzoezxboffx)
-- Author: Arena session
-- Date: 2026-10-18
-- ============================================================================
-- Purpose: Seed realistic dummy data for every module so each role (admin,
-- encoder, inspector, validator) sees relevant work in their dashboards.
--
-- Repeatable: deletes existing dummy seed records before inserting (via
-- TRUNCATE ... CASCADE). Safe to re-run on an empty or partially-seeded DB.
--
-- Constraints respected:
--   - Uses real barangay IDs from the existing barangays table (34 rows)
--   - Uses existing project_categories (5 rows)
--   - Uses existing profiles (4 accounts: admin, encoder, inspector, validator)
--   - Uses existing enum values for all typed columns
--   - DB triggers (log_activity, sync_road_after_inspection, protect_validation_columns,
--     set_updated_at, refresh_inspection_summary) will fire automatically.
-- ============================================================================

-- ============================================================================
-- 0. REPEATABLE CLEANUP (truncate domain tables in dependency order)
-- ============================================================================
TRUNCATE TABLE attachments,
         inspection_items,
         inspections,
         project_progress_updates,
         maintenance_records,
         projects,
         roads,
         contractors
         RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. CONTRACTORS (4) — needed by projects and maintenance
-- ============================================================================
INSERT INTO contractors (id, name, address, contact_information, pcab_license_no, created_at, updated_at)
VALUES
  ('5ac18445-605a-4078-8530-84a1457c47ac', 'Batangas Road Builders Inc.', 'Brgy. Poblacion, Mabini, Batangas', '0917-555-0101', 'PCAB-12345-A', now(), now()),
  ('6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'Mabini Engineering & Construction', 'Brgy. Mainaga, Mabini, Batangas', '0918-222-3303', 'PCAB-67890-B', now(), now()),
  ('287dd4f0-852a-443b-ad6a-98c85aed93dc', 'Calabarzon Infrastructure Corp.', 'Brgy. Santo Tomas, Mabini, Batangas', '0919-777-4444', 'PCAB-11223-C', now(), now()),
  ('83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'Southern Tagalog Contractors', 'Brgy. Mainit, Mabini, Batangas', '0920-888-9999', 'PCAB-44556-D', now(), now());

-- ============================================================================
-- 2. ROADS (10) — real Mabini barangay roads with varied conditions
-- ============================================================================
INSERT INTO roads (
  id, road_network_id, road_name, barangay_id, components, description,
  date_built, length_km, width_m, current_condition, last_inspection_date,
  created_by, created_at, updated_at
) VALUES
  -- Poblacion — concrete, good condition
  ('5dd0dd0c-4679-4ed2-9b04-eedda72d443c', 'MR-PB-001', 'Poblacion Main Road', 17,
   'concrete,shoulder,side_drain', 'Main arterial road connecting Poblacion to provincial highway.',
   '2018-06-15', 2.85, 6.5, 'good', '2025-09-10',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Mainaga — asphalt, fair condition
  ('b199e459-94f9-4d0c-bf1e-6aaf3cd821ac', 'MR-MG-002', 'Mainaga Access Road', 10,
   'asphalt,shoulder', 'Access road linking Mainaga to municipal center; moderate wear.',
   '2020-03-20', 1.42, 5.0, 'fair', '2025-08-22',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Mainit — concrete, poor condition (needs rehab)
  ('62593221-22f3-4df4-8981-593ba737f95b', 'MR-MN-003', 'Mainit Barangay Road', 11,
   'concrete,sidewalk,side_drain', 'Road to barangay hall; surface cracking and drainage blockage.',
   '2019-11-05', 0.95, 4.5, 'poor', '2025-07-30',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Ligaya — gravel/earth, bad condition
  ('a13a091c-cf86-47fa-9b0a-f3ded07b7873', 'MR-LG-004', 'Ligaya Farm Road', 9,
   'gravel,earth,shoulder', 'Gravel access road for agricultural transport; frequent flooding.',
   '2017-09-12', 3.10, 3.5, 'bad', '2025-06-15',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Malimatoc I — asphalt, fair
  ('800f2932-939e-4be9-baaa-c2d4ab20941e', 'MR-ML1-005', 'Malimatoc I Connector', 13,
   'asphalt,side_drain', 'Connector between Malimatoc I and provincial road network.',
   '2021-01-10', 1.78, 5.5, 'fair', '2025-05-18',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Malimatoc II — concrete, good
  ('a87b6de7-83b2-4cc3-b51b-8ca24d082d1e', 'MR-ML2-006', 'Malimatoc II Road', 14,
   'concrete,shoulder,sidewalk', 'Newly rehabilitated barangay road with sidewalk upgrades.',
   '2023-08-25', 1.25, 5.0, 'good', '2025-09-01',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Bagalangit — concrete, poor
  ('05732ce0-a9ec-4c4b-8c69-ee9baba7b744', 'MR-BG-007', 'Bagalangit Road', 3,
   'concrete,shoulder', 'Road serving Bagalangit residents; surface spalling observed.',
   '2020-07-08', 2.20, 5.5, 'poor', '2025-08-05',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Santo Tomas — asphalt, good
  ('d24ecacf-1c9e-4f11-9d0e-91bb91bf4591', 'MR-ST-008', 'Santo Tomas Road', 31,
   'asphalt,side_drain,shoulder', 'Well-maintained asphalt road connecting Santo Tomas.',
   '2019-04-03', 3.45, 6.0, 'good', '2025-09-05',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Pulong Balibaguhan — earth, bad
  ('5e8779fd-14ec-4357-a7ad-942c195d1785', 'MR-PB-009', 'Pulong Balibaguhan Trail', 21,
   'earth,gravel,shoulder', 'Rural trail; needs full rehabilitation and drainage.',
   '2016-02-20', 4.05, 3.0, 'bad', '2025-05-01',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- San Francisco — concrete, fair
  ('9006fbee-e114-4988-8d9e-d4b6981e217c', 'MR-SF-010', 'San Francisco Road', 24,
   'concrete,sidewalk,side_drain', 'Barangay road with sidewalk but aging concrete surface.',
   '2018-12-01', 1.65, 5.0, 'fair', '2025-07-12',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now());

-- ============================================================================
-- 3. PROJECTS (10) — varied categories, statuses, amounts, dates (2024-2026)
-- ============================================================================
INSERT INTO projects (
  id, project_name, road_id, category_id, category_other, description,
  barangay_id, date_started, target_completion_date, extensions_count,
  actual_completion_date, status, contractor_id, source_of_funds,
  appropriation, contracted_amount, adjusted_project_cost,
  completion_percentage, turnover_date,
  validation_status, validated_by, validated_at, validation_remarks,
  created_by, created_at, updated_at
) VALUES
  -- 01. Poblacion Concreting (National Road) — completed & turned over
  ('f663ca66-6098-4eec-b114-cd0b37b120b2', 'Poblacion Main Road Concreting & Drainage Rehab',
   '5dd0dd0c-4679-4ed2-9b04-eedda72d443c', 1, NULL,
   'Full rehabilitation of 2.85 km arterial road with new side drains and shoulder widening.',
   17, '2024-01-15', '2024-09-30', 0, '2024-09-28', 'turned_over',
   '5ac18445-605a-4078-8530-84a1457c47ac', 'National Road Fund',
   3200000.00, 2950000.00, 3100000.00, 100.00, '2024-10-05',
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-09-29 09:00:00+00', 'Project completed on time with no significant defects.',
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- 02. Mainaga Access Road Rehabilitation (Provincial) — completed
  ('cc7caef5-8934-4bea-88b2-9a4f48c6bcf5', 'Mainaga Access Road Rehab',
   'b199e459-94f9-4d0c-bf1e-6aaf3cd821ac', 2, NULL,
   'Asphalt overlay and shoulder repair for 1.42 km access road.',
   10, '2024-03-01', '2024-08-30', 1, '2024-09-10', 'completed',
   '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'Provincial Road Fund',
   1250000.00, 1180000.00, 1220000.00, 100.00, NULL,
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-09-15 10:30:00+00', 'Minor delay due to rain; final inspection satisfactory.',
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- 03. Mainit Barangay Road Repair (Barangay Road) — on_track
  ('ec2e8c19-df04-42d3-b622-d931645b7ec4', 'Mainit Road Surface Repair & Drainage',
   '62593221-22f3-4df4-8981-593ba737f95b', 5, NULL,
   'Concrete patching, drainage clearing, and sidewalk repair for 0.95 km.',
   11, '2025-01-20', '2025-07-30', 0, NULL, 'on_track',
   '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'Barangay Development Fund',
   850000.00, 820000.00, 840000.00, 72.00, NULL,
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-03-01 14:00:00+00', 'Good progress; concrete curing on schedule.',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- 04. Ligaya Farm Road Rehabilitation (Municipal Road) — planned
  ('b5a251a6-85a5-4f93-8c79-d163ec48f037', 'Ligaya Farm Road Full Rehab',
   'a13a091c-cf86-47fa-9b0a-f3ded07b7873', 4, NULL,
   'Full rehabilitation of 3.10 km gravel/earth road including drainage and shoulder.',
   9, '2025-11-01', '2026-05-30', 0, NULL, 'planned',
   '6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'Municipal Road Fund',
   450000.00, 430000.00, 440000.00, 0.00, NULL,
   'pending', NULL, NULL, NULL,
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- 05. Malimatoc I Connector Repair (Provincial) — delayed
  ('555ee865-c7cd-4047-89d5-8a7558f4e26d', 'Malimatoc I Connector Repair',
   '800f2932-939e-4be9-baaa-c2d4ab20941e', 2, NULL,
   'Asphalt resurfacing and shoulder repair; contractor facing material delays.',
   13, '2024-06-10', '2024-12-15', 2, NULL, 'delayed',
   '5ac18445-605a-4078-8530-84a1457c47ac', 'Provincial Road Fund',
   980000.00, 940000.00, 970000.00, 45.00, NULL,
   'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-11-20 11:00:00+00', 'Delayed due to asphalt supply chain; recommend extension.',
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- 06. Malimatoc II Road Upgrade (National Road) — completed
  ('6d55e5f0-66ec-465c-8b94-79ebbe22b22f', 'Malimatoc II Road Upgrade',
   'a87b6de7-83b2-4cc3-b51b-8ca24d082d1e', 1, NULL,
   'Upgrade to standard national road specs with sidewalk and drainage.',
   14, '2023-09-01', '2024-02-28', 1, '2024-03-10', 'completed',
   '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'National Road Fund',
   2100000.00, 1980000.00, 2050000.00, 100.00, '2024-03-15',
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-03-20 08:30:00+00', 'Completed ahead of schedule; excellent workmanship.',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- 07. Bagalangit Road Repair (Barangay Road) — on_track
  ('448746d4-913d-476d-97e3-415fb085f586', 'Bagalangit Road Surface Repair',
   '05732ce0-a9ec-4c4b-8c69-ee9baba7b744', 5, NULL,
   'Concrete patching and shoulder repair for 2.20 km barangay road.',
   3, '2025-02-01', '2025-08-15', 0, NULL, 'on_track',
   '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'Barangay Development Fund',
   680000.00, 650000.00, 670000.00, 65.00, NULL,
   'pending', NULL, NULL, NULL,
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- 08. Santo Tomas Road Drainage (Municipal Road) — planned
  ('a5ab30ab-3af0-4108-887b-c3c1ce075453', 'Santo Tomas Road Drainage Improvement',
   'd24ecacf-1c9e-4f11-9d0e-91bb91bf4591', 4, NULL,
   'Improvement of drainage system along 3.45 km asphalt road.',
   31, '2025-12-01', '2026-06-15', 0, NULL, 'planned',
   '6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'Municipal Road Fund',
   1150000.00, 1100000.00, 1120000.00, 0.00, NULL,
   'pending', NULL, NULL, NULL,
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- 09. Pulong Balibaguhan Trail Rehab (Municipal Road) — delayed
  ('740e7397-c402-4d69-849a-16775d496dc8', 'Pulong Balibaguhan Trail Rehabilitation',
   '5e8779fd-14ec-4357-a7ad-942c195d1785', 4, NULL,
   'Full rehabilitation including grading, drainage, and shoulder for 4.05 km.',
   21, '2024-09-01', '2025-03-30', 3, NULL, 'delayed',
   '5ac18445-605a-4078-8530-84a1457c47ac', 'Municipal Road Fund',
   1450000.00, 1390000.00, 1420000.00, 35.00, NULL,
   'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-04-05 13:15:00+00', 'Multiple delays; contractor requested extension. Recommend review.',
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- 10. San Francisco Road Repair (Barangay Road) — turned_over
  ('3bc76b7a-3330-4c7d-a269-19c8d0699da0', 'San Francisco Road Repair',
   '9006fbee-e114-4988-8d9e-d4b6981e217c', 5, NULL,
   'Surface repair and sidewalk maintenance for 1.65 km barangay road.',
   24, '2024-04-20', '2024-07-30', 0, '2024-08-02', 'turned_over',
   '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'Barangay Development Fund',
   620000.00, 590000.00, 600000.00, 100.00, '2024-08-10',
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-08-12 09:45:00+00', 'Turned over to barangay for maintenance.',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now());

-- ============================================================================
-- 4. INSPECTIONS (25) — varied scores, conditions, types
-- ============================================================================
INSERT INTO inspections (
  id, project_id, inspection_date, inspection_type, inspector_id,
  overall_score, overall_condition, remarks,
  validation_status, validated_by, validated_at, validation_remarks,
  created_at, updated_at
) VALUES
  -- Project 01 (completed) — 3 inspections
  ('3c3253e1-29b2-4f3e-8343-f24553187f39', 'f663ca66-6098-4eec-b114-cd0b37b120b2', '2024-06-01', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 92.5, 'good', 'Routine inspection shows excellent surface and drainage.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-06-02 09:00:00+00', 'No defects found.', now(), now()),
  ('4bb25d73-330f-4c3b-80ae-0ffea5cc3a85', 'f663ca66-6098-4eec-b114-cd0b37b120b2', '2024-09-01', 'type_acceptance', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 95.0, 'good', 'Acceptance inspection; project meets all specs.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-09-03 10:00:00+00', 'Turnover approved.', now(), now()),
  ('5a295348-5535-42cc-94e2-006415e5f1dc', 'f663ca66-6098-4eec-b114-cd0b37b120b2', '2024-10-20', 'follow_up', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 91.0, 'good', 'Post-turnover follow-up; minor settlement at chainage 1+200.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-10-22 08:30:00+00', 'Minor issue noted; repair not required.', now(), now()),

  -- Project 02 (completed) — 2 inspections
  ('43ab1b49-18e3-4e56-875a-3d75e64375d6', 'cc7caef5-8934-4bea-88b2-9a4f48c6bcf5', '2024-05-15', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 88.0, 'fair', 'Routine inspection shows moderate wear on asphalt overlay.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-05-16 11:00:00+00', 'Minor surface wear; recommend monitoring.', now(), now()),
  ('1f9e7283-f70b-4abe-9072-7d0f1cbcb449', 'cc7caef5-8934-4bea-88b2-9a4f48c6bcf5', '2024-08-25', 'type_acceptance', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 90.5, 'good', 'Acceptance inspection; final overlay quality good.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-08-27 09:30:00+00', 'Project accepted with minor observations.', now(), now()),

  -- Project 03 (on_track) — 3 inspections
  ('520080c6-1cdf-4424-a038-5c03897869af', 'ec2e8c19-df04-42d3-b622-d931645b7ec4', '2025-02-05', 'initial', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 78.0, 'poor', 'Initial inspection shows significant surface defects before repair.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-02-06 14:00:00+00', 'Repair scope inadequate; recommend expanding to drainage.', now(), now()),
  ('0aaebdd3-37b3-4a1f-8e45-aa0022a91e7d', 'ec2e8c19-df04-42d3-b622-d931645b7ec4', '2025-04-10', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 85.5, 'fair', 'Routine inspection after repair; surface improving.', 'pending', NULL, NULL, NULL, now(), now()),
  ('aa0960ab-bf03-4b00-bb41-8b9c68d27469', 'ec2e8c19-df04-42d3-b622-d931645b7ec4', '2025-07-01', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 89.0, 'good', 'Routine inspection; repair progressing well.', 'pending', NULL, NULL, NULL, now(), now()),

  -- Project 04 (planned) — 1 inspection (pre-construction)
  ('be33e512-31df-4a14-a8a2-e0b3a6fec625', 'b5a251a6-85a5-4f93-8c79-d163ec48f037', '2025-09-10', 'initial', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 52.0, 'bad', 'Pre-construction survey; road severely deteriorated.', 'pending', NULL, NULL, NULL, now(), now()),

  -- Project 05 (delayed) — 2 inspections
  ('b8360c57-df37-4018-9af3-55240a7f7cf4', '555ee865-c7cd-4047-89d5-8a7558f4e26d', '2024-07-10', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 68.0, 'poor', 'Routine inspection shows delays in asphalt delivery.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-10-05 10:00:00+00', 'Project behind schedule; recommend schedule revision.', now(), now()),
  ('14187f29-6ee3-4497-b825-9d369a4a4f50', '555ee865-c7cd-4047-89d5-8a7558f4e26d', '2024-11-15', 'follow_up', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 62.0, 'poor', 'Follow-up inspection; still no significant progress.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-11-20 11:00:00+00', 'Delays persistent; contractor needs intervention.', now(), now()),

  -- Project 06 (completed) — 2 inspections
  ('93b6092a-cbf5-49ec-90fc-453ac60c065c', '6d55e5f0-66ec-465c-8b94-79ebbe22b22f', '2023-11-05', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 94.0, 'good', 'Routine inspection during construction.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2023-11-07 08:00:00+00', 'Progress excellent.', now(), now()),
  ('0f9e5fb6-7d6f-4e30-8125-119b0e991d13', '6d55e5f0-66ec-465c-8b94-79ebbe22b22f', '2024-03-05', 'type_acceptance', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 93.5, 'good', 'Acceptance inspection for completed upgrade.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-03-20 09:00:00+00', 'Project meets national specs.', now(), now()),

  -- Project 07 (on_track) — 3 inspections
  ('a3a93bd2-bea0-4225-800b-64b417400417', '448746d4-913d-476d-97e3-415fb085f586', '2025-03-01', 'initial', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 75.0, 'poor', 'Initial inspection before repair.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-03-02 13:30:00+00', 'Surface defects require broader repair scope.', now(), now()),
  ('b911da24-d91b-4f6b-b739-06ee4916a45d', '448746d4-913d-476d-97e3-415fb085f586', '2025-05-20', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 82.0, 'fair', 'Routine inspection after partial repair.', 'pending', NULL, NULL, NULL, now(), now()),
  ('2578bf43-d539-47c2-9924-9113d24a6da7', '448746d4-913d-476d-97e3-415fb085f586', '2025-08-01', 'follow_up', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 87.5, 'good', 'Follow-up shows improvement.', 'pending', NULL, NULL, NULL, now(), now()),

  -- Project 08 (planned) — 1 inspection
  ('7d58f3b2-1f4a-44ef-b7a9-9351c94bdf0a', 'a5ab30ab-3af0-4108-887b-c3c1ce075453', '2025-10-15', 'initial', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 65.0, 'poor', 'Initial survey for drainage improvement.', 'pending', NULL, NULL, NULL, now(), now()),

  -- Project 09 (delayed) — 2 inspections
  ('3c054846-0b05-4eb5-8aa2-bbe0255e9d89', '740e7397-c402-4d69-849a-16775d496dc8', '2025-01-10', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 55.0, 'bad', 'Routine inspection; significant deterioration observed.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-03-01 10:00:00+00', 'Severe deterioration; recommend full rehab.', now(), now()),
  ('95c5d4c6-f1d3-42cb-a13d-76357b03f37f', '740e7397-c402-4d69-849a-16775d496dc8', '2025-05-20', 'follow_up', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 58.0, 'bad', 'Follow-up shows no improvement.', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-06-10 11:30:00+00', 'Delays continue; contractor needs review.', now(), now()),

  -- Project 10 (turned_over) — 3 inspections
  ('7b663ee6-97b9-48f6-82a7-aee8bb246733', '3bc76b7a-3330-4c7d-a269-19c8d0699da0', '2024-05-10', 'routine', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 93.0, 'good', 'Routine inspection during repair.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-05-11 09:00:00+00', 'Progress excellent.', now(), now()),
  ('550e2cb5-625f-4e9b-b0d0-86edfd8c52f6', '3bc76b7a-3330-4c7d-a269-19c8d0699da0', '2024-07-25', 'type_acceptance', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 94.5, 'good', 'Acceptance inspection; repair completed.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-08-05 08:45:00+00', 'Repair completed to spec.', now(), now()),
  ('57ee5502-47b5-45b6-bb23-e4b9cc747301', '3bc76b7a-3330-4c7d-a269-19c8d0699da0', '2024-09-30', 'follow_up', 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', 92.0, 'good', 'Post-turnover follow-up.', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-10-01 09:30:00+00', 'Road in good condition post-turnover.', now(), now());

-- ============================================================================
-- 5. INSPECTION ITEMS (select subset — varied component scores)
-- ============================================================================
INSERT INTO inspection_items (
  id, inspection_id, component, rating, score, remarks
) VALUES
  -- Inspection 01 (good) — high scores
  ('f1a1a1a1-1111-1111-1111-111111111111', '3c3253e1-29b2-4f3e-8343-f24553187f39', 'concrete', 'good', 95, 'Surface smooth and well-cured.'),
  ('f1a1a1a1-1111-1111-1111-111111111112', '3c3253e1-29b2-4f3e-8343-f24553187f39', 'shoulder', 'good', 93, 'Shoulder width adequate; minor settlement.'),
  ('f1a1a1a1-1111-1111-1111-111111111113', '3c3253e1-29b2-4f3e-8343-f24553187f39', 'side_drain', 'good', 94, 'Drainage clear; no blockage.'),

  -- Inspection 02 (good) — high scores
  ('f2b2b2b2-2222-2222-2222-222222222222', '4bb25d73-330f-4c3b-80ae-0ffea5cc3a85', 'concrete', 'good', 96, 'Surface excellent post-acceptance.'),
  ('f2b2b2b2-2222-2222-2222-222222222223', '4bb25d73-330f-4c3b-80ae-0ffea5cc3a85', 'side_drain', 'good', 92, 'Drainage functioning well.'),

  -- Inspection 05 (poor) — lower scores for repair tracking
  ('f3c3c3c3-3333-3333-3333-333333333333', '520080c6-1cdf-4424-a038-5c03897869af', 'concrete', 'poor', 72, 'Multiple surface cracks; patching needed.'),
  ('f3c3c3c3-3333-3333-3333-333333333334', '520080c6-1cdf-4424-a038-5c03897869af', 'side_drain', 'poor', 68, 'Drainage blocked; cleaning required.'),

  -- Inspection 10 (good) — high scores
  ('f4d4d4d4-4444-4444-4444-444444444444', 'b8360c57-df37-4018-9af3-55240a7f7cf4', 'asphalt', 'good', 88, 'Asphalt surface good; minor wear.'),
  ('f4d4d4d4-4444-4444-4444-444444444445', 'b8360c57-df37-4018-9af3-55240a7f7cf4', 'shoulder', 'fair', 80, 'Shoulder shows slight erosion.'),

  -- Inspection 14 (poor) — very low scores to make charts alive
  ('f5e5e5e5-5555-5555-5555-555555555555', '3c054846-0b05-4eb5-8aa2-bbe0255e9d89', 'gravel', 'bad', 42, 'Gravel severely eroded; almost impassable.'),
  ('f5e5e5e5-5555-5555-5555-555555555556', '3c054846-0b05-4eb5-8aa2-bbe0255e9d89', 'shoulder', 'bad', 38, 'Shoulder collapsed.'),

  -- Inspection 20 (good) — balanced
  ('f6f6f6f6-6666-6666-6666-666666666666', '93b6092a-cbf5-49ec-90fc-453ac60c065c', 'concrete', 'good', 94, 'Concrete surface in excellent condition.'),
  ('f6f6f6f6-6666-6666-6666-666666666667', '93b6092a-cbf5-49ec-90fc-453ac60c065c', 'sidewalk', 'good', 92, 'Sidewalk intact.'),

  -- Inspection 24 (poor) — varied ratings
  ('f7g7g7g7-7777-7777-7777-777777777777', '0aaebdd3-37b3-4a1f-8e45-aa0022a91e7d', 'concrete', 'fair', 82, 'Concrete surface improving after repair.'),
  ('f7g7g7g7-7777-7777-7777-777777777778', '0aaebdd3-37b3-4a1f-8e45-aa0022a91e7d', 'side_drain', 'fair', 78, 'Drainage partially cleared.');

-- ============================================================================
-- 6. MAINTENANCE RECORDS (15) — mix of scheduled / in_progress / completed
-- ============================================================================
INSERT INTO maintenance_records (
  id, project_id, inspection_id, contractor_id,
  maintenance_type, activities, remarks,
  scheduled_date, completed_date, cost, status,
  validation_status, validated_by, validated_at, validation_remarks,
  created_by, created_at, updated_at
) VALUES
  -- Completed (approved by validator)
  ('37ec8498-953f-4afb-94ce-67ce513c7768', 'f663ca66-6098-4eec-b114-cd0b37b120b2', '4bb25d73-330f-4c3b-80ae-0ffea5cc3a85', '5ac18445-605a-4078-8530-84a1457c47ac', 'routine', 'Drainage cleaning and shoulder trimming.', 'Routine maintenance completed satisfactorily.', '2025-01-10', '2025-01-12', 25000.00, 'completed', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-01-13 10:00:00+00', 'Routine maintenance verified.', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- In progress (approved)
  ('d70156ff-5f21-470c-ab2a-e0ca19f6b4fd', 'ec2e8c19-df04-42d3-b622-d931645b7ec4', '520080c6-1cdf-4424-a038-5c03897869af', '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'corrective', 'Concrete patching and drainage repair on Mainit Road.', 'Ongoing repair; concrete curing phase.', '2025-05-01', NULL, 85000.00, 'in_progress', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-05-05 12:00:00+00', 'Repair approved for continuation.', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- Scheduled (pending)
  ('d02d4f27-487f-4c28-bea4-bbd46f2e2bfb', 'b5a251a6-85a5-4f93-8c79-d163ec48f037', 'be33e512-31df-4a14-a8a2-e0b3a6fec625', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'preventive', 'Scheduled grading and drainage installation before rainy season.', 'Preventive maintenance scheduled.', '2025-11-15', NULL, 45000.00, 'scheduled', 'pending', NULL, NULL, NULL, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Completed (rejected by validator — has remarks)
  ('783be5ec-fa7b-41c2-a03b-ad067e040746', '555ee865-c7cd-4047-89d5-8a7558f4e26d', 'b8360c57-df37-4018-9af3-55240a7f7cf4', '6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'emergency', 'Emergency shoulder repair after rain damage.', 'Repair completed but quality below spec.', '2024-09-05', '2024-09-08', 62000.00, 'completed', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-09-10 14:00:00+00', 'Repair quality below standard; recommend rework.', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- In progress (pending)
  ('291df093-177c-42a9-a0f4-9fb31ff40af3', '448746d4-913d-476d-97e3-415fb085f586', '2578bf43-d539-47c2-9924-9113d24a6da7', '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'corrective', 'Concrete patching on Bagalangit Road.', 'Repair in progress; concrete curing.', '2025-06-10', NULL, 78000.00, 'in_progress', 'pending', NULL, NULL, NULL, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Completed (approved)
  ('ebbca13a-e3c3-49bf-888b-ed3fea712d67', '6d55e5f0-66ec-465c-8b94-79ebbe22b22f', '93b6092a-cbf5-49ec-90fc-453ac60c065c', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'routine', 'Routine drainage and shoulder maintenance.', 'Routine maintenance verified.', '2024-01-15', '2024-01-18', 32000.00, 'completed', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-01-19 09:00:00+00', 'Routine work completed.', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Scheduled (pending)
  ('08f2393b-017e-42b8-9ebb-3b55b3bbbe74', '740e7397-c402-4d69-849a-16775d496dc8', '3c054846-0b05-4eb5-8aa2-bbe0255e9d89', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'preventive', 'Preventive grading and shoulder repair before rainy season.', 'Preventive maintenance planned.', '2026-01-10', NULL, 95000.00, 'scheduled', 'pending', NULL, NULL, NULL, '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- Completed (approved)
  ('e982ce75-15ef-4584-aa0d-56643c27e6e6', 'a5ab30ab-3af0-4108-887b-c3c1ce075453', '7d58f3b2-1f4a-44ef-b7a9-9351c94bdf0a', '5ac18445-605a-4078-8530-84a1457c47ac', 'routine', 'Routine shoulder trimming and drainage cleaning.', 'Routine maintenance completed.', '2025-08-25', '2025-08-28', 18000.00, 'completed', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-08-29 08:30:00+00', 'Routine work verified.', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- In progress (rejected by validator — has remarks)
  ('f38a1f64-8f87-4b62-b5d1-7cb139dae1ad', '555ee865-c7cd-4047-89d5-8a7558f4e26d', '14187f29-6ee3-4497-b825-9d369a4a4f50', '6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'emergency', 'Emergency shoulder repair after rain damage.', 'Repair started but quality concerns identified.', '2024-11-12', NULL, 72000.00, 'in_progress', 'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-11-25 11:00:00+00', 'Quality below standard; stop work and revise.', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- Completed (pending validation — validator hasn't reviewed yet)
  ('4d401cfe-645e-4a80-aa87-a0a9044d9d60', 'cc7caef5-8934-4bea-88b2-9a4f48c6bcf5', '43ab1b49-18e3-4e56-875a-3d75e64375d6', '5ac18445-605a-4078-8530-84a1457c47ac', 'routine', 'Routine shoulder trimming.', 'Routine maintenance completed; awaiting validation.', '2024-06-10', '2024-06-12', 22000.00, 'completed', 'pending', NULL, NULL, NULL, '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- Scheduled (pending)
  ('187448df-17ef-49e5-92d7-40cfb725e949', '448746d4-913d-476d-97e3-415fb085f586', 'b911da24-d91b-4f6b-b739-06ee4916a45d', '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'corrective', 'Concrete patching scheduled for next quarter.', 'Repair planned for next quarter.', '2025-10-01', NULL, 92000.00, 'scheduled', 'pending', NULL, NULL, NULL, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Completed (approved)
  ('78cc1818-e160-4fe7-9d55-1d55cc82f7c0', '3bc76b7a-3330-4c7d-a269-19c8d0699da0', '550e2cb5-625f-4e9b-b0d0-86edfd8c52f6', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'routine', 'Routine shoulder trimming and drainage cleaning.', 'Routine maintenance completed.', '2024-06-05', '2024-06-07', 15000.00, 'completed', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-06-08 09:00:00+00', 'Routine work verified.', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Scheduled (pending)
  ('0a48646b-6fe7-4c63-bf42-472c9c5664f5', 'a5ab30ab-3af0-4108-887b-c3c1ce075453', '7d58f3b2-1f4a-44ef-b7a9-9351c94bdf0a', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'preventive', 'Preventive grading and shoulder repair.', 'Preventive maintenance planned.', '2026-02-01', NULL, 48000.00, 'scheduled', 'pending', NULL, NULL, NULL, '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now()),

  -- In progress (pending)
  ('2c635ea2-ed5d-43b8-8b71-8bb157b9ad65', '740e7397-c402-4d69-849a-16775d496dc8', '95c5d4c6-f1d3-42cb-a13d-76357b03f37f', '5ac18445-605a-4078-8530-84a1457c47ac', 'corrective', 'Corrective grading and shoulder repair.', 'Repair in progress; grading started.', '2025-06-01', NULL, 110000.00, 'in_progress', 'pending', NULL, NULL, NULL, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now()),

  -- Completed (approved)
  ('d1e782cc-3563-4b98-9e66-0cb335a70a7c', '3bc76b7a-3330-4c7d-a269-19c8d0699da0', '57ee5502-47b5-45b6-bb23-e4b9cc747301', '287dd4f0-852a-443b-ad6a-98c85aed93dc', 'routine', 'Routine shoulder trimming.', 'Routine maintenance completed.', '2024-09-20', '2024-09-22', 28000.00, 'completed', 'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-09-23 09:00:00+00', 'Routine work verified.', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now());

-- ============================================================================
-- 7. PROJECT PROGRESS UPDATES (optional — triggers sync_project_progress)
-- ============================================================================
INSERT INTO project_progress_updates (
  id, project_id, reported_by, completion_percentage, amount_spent,
  remarks, created_at, updated_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'f663ca66-6098-4eec-b114-cd0b37b120b2', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', 100.00, 3100000.00, 'Final progress update before turnover.', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cc7caef5-8934-4bea-88b2-9a4f48c6bcf5', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', 100.00, 1220000.00, 'Project completed; final amount spent verified.', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'ec2e8c19-df04-42d3-b622-d931645b7ec4', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', 72.00, 605000.00, 'Progress on track; concrete repair 72% complete.', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '555ee865-c7cd-4047-89d5-8a7558f4e26d', 'e862213d-3e7f-4ee8-abbe-348afa4a1611', 45.00, 436500.00, 'Delayed; progress at 45% due to material shortages.', now(), now()),
  ('55555555-5555-5555-5555-555555555555', '6d55e5f0-66ec-465c-8b94-79ebbe22b22f', '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', 100.00, 2050000.00, 'Upgrade completed; final inspection approved.', now(), now());

-- ============================================================================
-- 8. ATTACHMENTS (optional metadata — links to projects, inspections, maintenance)
-- ============================================================================
INSERT INTO attachments (
  id, project_id, inspection_id, maintenance_id, category, file_name,
  storage_path, mime_type, file_size, uploaded_by, created_at
) VALUES
  ('a1a1a1a1-1111-1111-1111-111111111111', 'f663ca66-6098-4eec-b114-cd0b37b120b2', NULL, NULL, 'project_attachment', 'Poblanc_Main_Road_Design.pdf', 'wblrms-files/projects/f663ca66-6098-4eec-b114-cd0b37b120b2/design.pdf', 'application/pdf', 2450000, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now()),
  ('b2b2b2b2-2222-2222-2222-222222222222', 'f663ca66-6098-4eec-b114-cd0b37b120b2', NULL, NULL, 'turnover_certificate', 'Turnover_Certificate_Project01.pdf', 'wblrms-files/projects/f663ca66-6098-4eec-b114-cd0b37b120b2/turnover.pdf', 'application/pdf', 980000, '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', now()),
  ('c3c3c3c3-3333-3333-3333-333333333333', NULL, '3c3253e1-29b2-4f3e-8343-f24553187f39', NULL, 'inspection_photo', 'Inspection_Photo_01.jpg', 'wblrms-files/inspections/3c3253e1-29b2-4f3e-8343-f24553187f39/photo01.jpg', 'image/jpeg', 1200000, 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', now()),
  ('d4d4d4d4-4444-4444-4444-444444444444', NULL, '520080c6-1cdf-4424-a038-5c03897869af', NULL, 'inspection_photo', 'Inspection_Photo_05.jpg', 'wblrms-files/inspections/520080c6-1cdf-4424-a038-5c03897869af/photo05.jpg', 'image/jpeg', 1450000, 'a5c2ba49-bb38-4ef9-9ca1-49f8bc3586ea', now()),
  ('e5e5e5e5-5555-5555-5555-555555555555', NULL, NULL, '37ec8498-953f-4afb-94ce-67ce513c7768', 'maintenance_document', 'Maintenance_Report_01.pdf', 'wblrms-files/maintenance/37ec8498-953f-4afb-94ce-67ce513c7768/report.pdf', 'application/pdf', 850000, 'e862213d-3e7f-4ee8-abbe-348afa4a1611', now());

-- ============================================================================
-- 9. VERIFICATION QUERIES (run these separately or include in reports)
-- ============================================================================
/*
SELECT 'Roads' AS table_name, COUNT(*) AS row_count FROM roads
UNION ALL SELECT 'Projects', COUNT(*) FROM projects
UNION ALL SELECT 'Inspections', COUNT(*) FROM inspections
UNION ALL SELECT 'Inspection Items', COUNT(*) FROM inspection_items
UNION ALL SELECT 'Maintenance', COUNT(*) FROM maintenance_records
UNION ALL SELECT 'Attachments', COUNT(*) FROM attachments
UNION ALL SELECT 'Project Progress', COUNT(*) FROM project_progress_updates
UNION ALL SELECT 'Contractors', COUNT(*) FROM contractors;

SELECT * FROM v_project_overview ORDER BY project_id LIMIT 5;
SELECT * FROM v_condition_summary;
SELECT * FROM v_monthly_maintenance_cost;
*/
