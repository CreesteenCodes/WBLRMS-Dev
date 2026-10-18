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
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now());