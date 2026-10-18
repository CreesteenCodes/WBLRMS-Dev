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

  -- 05. Malimatoc I Connector Repair (Provincial) — delayed
  ('555ee865-c7cd-4047-89d5-8a7558f4e26d', 'Malimatoc I Connector Repair',
   '800f2932-939e-4be9-baaa-c2d4ab20941e', 2, NULL,
   'Asphalt resurfacing and shoulder repair; contractor facing material delays.',
   13, '2024-06-10', '2024-12-15', 2, NULL, 'delayed',
   '5ac18445-605a-4078-8530-84a1457c47ac', 'Provincial Road Fund',
   980000.00, 940000.00, 970000.00, 45.00, NULL,
   'rejected', '304855f7-cdad-4bb1-8bd3-10bcf7548dc6', '2024-11-20 11:00:00+00', 'Delayed due to asphalt supply chain; recommend extension.',
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now());
