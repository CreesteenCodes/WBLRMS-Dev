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
