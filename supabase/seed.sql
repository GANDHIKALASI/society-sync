-- SocietySync Rich Production Mock Data Script
-- Safe to execute multiple times in Supabase SQL Editor

-- 1. DEFAULT SOCIETY
INSERT INTO public.societies (name, code, address, city, state, pincode, maintenance_rate)
VALUES ('SocietySync Grand Residency', 'SSGR01', 'Bhubaneswar, Odisha', 'Bhubaneswar', 'Odisha', '751001', 2500.00)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED BLOCKS
INSERT INTO public.blocks (name, total_floors, total_flats, society_id)
SELECT 'Block A', 5, 20, id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.blocks (name, total_floors, total_flats, society_id)
SELECT 'Block B', 5, 20, id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.blocks (name, total_floors, total_flats, society_id)
SELECT 'Block C', 5, 20, id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

-- 3. SEED FLATS
INSERT INTO public.flats (block_name, flat_number, floor_number, status, owner_name, owner_phone, owner_email, society_id)
SELECT 'Block A', 'A-101', 1, 'occupied', 'Aarav Sharma', '+91 9876543210', 'aarav@example.com', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.flats (block_name, flat_number, floor_number, status, owner_name, owner_phone, owner_email, society_id)
SELECT 'Block A', 'A-102', 1, 'occupied', 'Priya Verma', '+91 9876543211', 'priya@example.com', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.flats (block_name, flat_number, floor_number, status, owner_name, owner_phone, owner_email, society_id)
SELECT 'Block B', 'B-201', 2, 'occupied', 'Rohan Das', '+91 9876543212', 'rohan@example.com', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.flats (block_name, flat_number, floor_number, status, owner_name, owner_phone, owner_email, society_id)
SELECT 'Block C', 'C-301', 3, 'vacant', 'Sneha Mohanty', '+91 9876543213', 'sneha@example.com', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

-- 4. SEED MOCK PROFILES (RESIDENTS & EMPLOYEES)
-- Note: UUIDs generated for demonstration records
INSERT INTO public.profiles (id, full_name, email, phone, role, status, block, flat_number, occupancy_type, society_id)
SELECT '11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'aarav@example.com', '+91 9876543210', 'resident', 'approved', 'Block A', 'A-101', 'owner', id
FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'approved';

INSERT INTO public.profiles (id, full_name, email, phone, role, status, block, flat_number, occupancy_type, society_id)
SELECT '22222222-2222-2222-2222-222222222222', 'Priya Verma', 'priya@example.com', '+91 9876543211', 'resident', 'approved', 'Block A', 'A-102', 'owner', id
FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'approved';

INSERT INTO public.profiles (id, full_name, email, phone, role, status, block, flat_number, occupancy_type, society_id)
SELECT '33333333-3333-3333-3333-333333333333', 'Rohan Das', 'rohan@example.com', '+91 9876543212', 'resident', 'pending', 'Block B', 'B-201', 'tenant', id
FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'pending';

INSERT INTO public.profiles (id, full_name, email, phone, role, status, designation, society_id)
SELECT '44444444-4444-4444-4444-444444444444', 'Ramesh Kumar', 'ramesh@societysync.app', '+91 9811122233', 'employee', 'approved', 'Security Guard', id
FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'approved';

INSERT INTO public.profiles (id, full_name, email, phone, role, status, designation, society_id)
SELECT '55555555-5555-5555-5555-555555555555', 'Suresh Patel', 'suresh@societysync.app', '+91 9822233344', 'employee', 'approved', 'Facility Manager', id
FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, status = 'approved';

-- 5. SEED MAINTENANCE BILLS
INSERT INTO public.maintenance_bills (flat_number, title, amount, due_date, status, period, society_id)
SELECT 'A-101', 'Monthly Maintenance Fee - Aug 2026', 2500.00, '2026-08-31', 'pending', 'August 2026', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_bills (flat_number, title, amount, due_date, status, period, society_id)
SELECT 'A-102', 'Monthly Maintenance Fee - Aug 2026', 2500.00, '2026-08-31', 'paid', 'August 2026', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_bills (flat_number, title, amount, due_date, status, period, society_id)
SELECT 'B-201', 'Monthly Maintenance Fee - Aug 2026', 2500.00, '2026-08-31', 'pending', 'August 2026', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

-- 6. SEED VISITOR PASSES
INSERT INTO public.visitor_passes (visitor_name, visitor_phone, vehicle_number, purpose, pass_code, status, society_id)
SELECT 'Vikram Singh', '+91 9777888999', 'OD-02-AX-5544', 'Amazon Courier Delivery', 'PASS-8421', 'checked_in', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.visitor_passes (visitor_name, visitor_phone, vehicle_number, purpose, pass_code, status, society_id)
SELECT 'Ananya Mishra', '+91 9666777888', 'OD-02-BZ-1122', 'Family Visit', 'PASS-3190', 'approved', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

-- 7. SEED ANNOUNCEMENTS / NOTICES
INSERT INTO public.announcements (title, content, priority, target_role, society_id)
SELECT 'Annual General Body Meeting 2026', 'All residents are invited to attend the Annual General Meeting at the Community Hall this Sunday at 10:00 AM.', 'important', 'all', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.announcements (title, content, priority, target_role, society_id)
SELECT 'Scheduled Water Tank Cleaning', 'Water supply will be temporarily paused on Thursday between 2:00 PM and 5:00 PM for overhead tank sanitization.', 'urgent', 'resident', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

-- 8. SEED EVENTS
INSERT INTO public.events (title, description, location, event_date, start_time, end_time, society_id)
SELECT 'Ganesh Chaturthi Celebration', 'Grand Puja and cultural evening organized by Society Cultural Club.', 'Clubhouse Lawn', '2026-09-07', '09:00:00', '21:00:00', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (title, description, location, event_date, start_time, end_time, society_id)
SELECT 'Tree Plantation & Eco Drive', 'Join us in planting 100 saplings across society green belts.', 'Central Park', '2026-08-15', '08:00:00', '11:00:00', id FROM public.societies WHERE code = 'SSGR01'
ON CONFLICT DO NOTHING;
