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

  -- 04. Ligaya Farm Road Rehabilitation (Municipal Road) — planned
  ('b5a251a6-85a5-4f93-8c79-d163ec48f037', 'Ligaya Farm Road Full Rehab',
   'a13a091c-cf86-47fa-9b0a-f3ded07b7873', 4, NULL,
   'Full rehabilitation of 3.10 km gravel/earth road including drainage and shoulder.',
   9, '2025-11-01', '2026-05-30', 0, NULL, 'planned',
   '6c9b50cd-661c-49ae-ab5b-14e2f87e048d', 'Municipal Road Fund',
   450000.00, 430000.00, 440000.00, 0.00, NULL,
   'pending', NULL, NULL, NULL,
   'e862213d-3e7f-4ee8-abbe-348afa4a1611', now(), now());
