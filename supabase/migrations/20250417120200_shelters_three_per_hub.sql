-- Replace legacy one-shelter-per-hub rows with three spokes per hub (matches src/lib/mock-data.ts).

DELETE FROM public.shelters
WHERE id IN ('sh-1', 'sh-2', 'sh-3');

INSERT INTO public.shelters (id, warehouse_id, name, address, estimated_meals, headcount)
VALUES
  ('sh-north-a', 'wh-north', 'Memorial Field — Hall A', 'Memorial Field, Gate C (west)', 520, 240),
  ('sh-north-b', 'wh-north', 'Civic Center — Banquet wing', '100 Civic Plaza, lower level', 480, 210),
  ('sh-north-c', 'wh-north', 'North Gymnasium annex', '80 School Row, annex doors', 400, 170),
  ('sh-river-a', 'wh-river', 'Riverside HS — Main gym', '200 School Ln, gym entrance', 410, 180),
  ('sh-river-b', 'wh-river', 'Harbor community hall', '14 Harbor Rd, rear hall', 360, 150),
  ('sh-river-c', 'wh-river', 'Riverside library basement', '55 Riverwalk, basement B', 210, 80),
  ('sh-east-a', 'wh-east', 'Eastside Arena — Hall 2', 'Arena lower concourse, Hall 2', 720, 310),
  ('sh-east-b', 'wh-east', 'Stadium parking — Pavilion B', '1 Stadium Way, Lot B tents', 540, 260),
  ('sh-east-c', 'wh-east', 'Eastside middle school cafeteria', '40 East Blvd, cafeteria + kitchen', 620, 290)
ON CONFLICT (id) DO UPDATE SET
  warehouse_id = excluded.warehouse_id,
  name = excluded.name,
  address = excluded.address,
  estimated_meals = excluded.estimated_meals,
  headcount = excluded.headcount;
