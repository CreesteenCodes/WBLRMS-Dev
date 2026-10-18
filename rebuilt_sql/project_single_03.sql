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

  -- 03. Mainit Barangay Road Repair (Barangay Road) — on_track
  ('ec2e8c19-df04-42d3-b622-d931645b7ec4', 'Mainit Road Surface Repair & Drainage',
   '62593221-22f3-4df4-8981-593ba737f95b', 5, NULL,
   'Concrete patching, drainage clearing, and sidewalk repair for 0.95 km.',
   11, '2025-01-20', '2025-07-30', 0, NULL, 'on_track',
   '83e5b9ac-586a-4e35-815a-f29b9d816aa4', 'Barangay Development Fund',
   850000.00, 820000.00, 840000.00, 72.00, NULL,
   'approved', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2025-03-01 14:00:00+00', 'Good progress; concrete curing on schedule.',
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now());
