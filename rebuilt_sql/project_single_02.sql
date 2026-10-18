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
   '6ae8f446-b4fe-46c0-baf0-c06e7b1411f4', now(), now());
