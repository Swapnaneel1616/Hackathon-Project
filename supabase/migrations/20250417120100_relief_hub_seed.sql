-- Seed reference data (matches src/lib/mock-data.ts defaults).

INSERT INTO public.app_settings (id, disaster_phase, hours_to_impact)
VALUES (1, 'watch_pre', 72)
ON CONFLICT (id) DO UPDATE SET
  disaster_phase = excluded.disaster_phase,
  hours_to_impact = excluded.hours_to_impact,
  updated_at = now();

INSERT INTO public.warehouses (id, name, address, lat, lng, is_government_site, category_caps, category_stock)
VALUES
  (
    'wh-north',
    'North District Relief Hub',
    '1200 Civic Center Blvd, District 4',
    40.78,
    -73.97,
    TRUE,
    '{"protein":800,"carbs":1200,"fiber":600,"produce":500,"hydration":900}'::jsonb,
    '{"protein":120,"carbs":700,"fiber":400,"produce":90,"hydration":820}'::jsonb
  ),
  (
    'wh-river',
    'Riverside Community Warehouse',
    '88 Harbor Rd (Municipal depot)',
    40.75,
    -73.99,
    TRUE,
    '{"protein":500,"carbs":900,"fiber":450,"produce":400,"hydration":600}'::jsonb,
    '{"protein":380,"carbs":520,"fiber":300,"produce":260,"hydration":410}'::jsonb
  ),
  (
    'wh-east',
    'Eastside Stadium Annex',
    '1 Stadium Way (Gov lease)',
    40.73,
    -73.93,
    TRUE,
    '{"protein":650,"carbs":1000,"fiber":500,"produce":550,"hydration":700}'::jsonb,
    '{"protein":520,"carbs":780,"fiber":420,"produce":400,"hydration":590}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  is_government_site = excluded.is_government_site,
  category_caps = excluded.category_caps,
  category_stock = excluded.category_stock,
  updated_at = now();

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

INSERT INTO public.catalog_items (id, name, category, description, sort_order)
VALUES
  ('beans', 'Fortified beans (pouch)', 'protein', 'Shelf-stable legume protein', 10),
  ('eggs', 'Pasteurized egg mix', 'protein', 'Controlled-temp alternative where eggs unavailable', 20),
  ('rice', 'Parboiled rice (1kg)', 'carbs', 'Primary energy staple', 30),
  ('oats', 'Rolled oats (800g)', 'fiber', 'Fiber-forward breakfast staple', 40),
  ('veg-mix', 'Dehydrated veg mix', 'produce', 'Micronutrient-dense add-in', 50),
  ('water', 'Drinking water (6L)', 'hydration', 'Hydration priority pack', 60)
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  sort_order = excluded.sort_order;
