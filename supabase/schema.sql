-- SocietySync Comprehensive Supabase Database Schema
-- Production Ready Schema with Idempotent RLS Policies & Triggers

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  maintenance_rate NUMERIC(10,2) DEFAULT 2500.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'resident', 'employee')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  block TEXT,
  flat_number TEXT,
  occupancy_type TEXT CHECK (occupancy_type IN ('owner', 'tenant', 'family')),
  designation TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_floors INT DEFAULT 5,
  total_flats INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. FLATS TABLE
CREATE TABLE IF NOT EXISTS public.flats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  block_name TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  floor_number INT DEFAULT 1,
  status TEXT DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant', 'under_maintenance')),
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  tenant_name TEXT,
  tenant_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT,
  is_emergency_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'scooter', 'other')),
  parking_slot TEXT,
  model_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PETS TABLE
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  breed TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. VISITOR PASSES TABLE
CREATE TABLE IF NOT EXISTS public.visitor_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  vehicle_number TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purpose TEXT,
  pass_code TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'checked_in', 'checked_out', 'rejected')),
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. PARKING SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  block_name TEXT,
  slot_type TEXT DEFAULT 'car' CHECK (slot_type IN ('car', 'two_wheeler', 'visitor')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'reserved')),
  assigned_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. MAINTENANCE BILLS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  flat_number TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  period TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.maintenance_bills(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  paid_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- 14. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. SERVICE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'maintenance',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. EMPLOYEE TASKS TABLE
CREATE TABLE IF NOT EXISTS public.employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'casual',
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '10:00:00',
  end_time TIME NOT NULL DEFAULT '13:00:00',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'resident', 'employee')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  file_url TEXT NOT NULL,
  access_role TEXT NOT NULL DEFAULT 'all' CHECK (access_role IN ('all', 'resident', 'employee', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 23. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 24. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 25. APPROVAL EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.approval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  acted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 26. AUTOMATED PROFILE TRIGGER FOR AUTH.USERS SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_society_id UUID;
BEGIN
  SELECT id INTO default_society_id FROM public.societies LIMIT 1;
  
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    email,
    role,
    status,
    society_id,
    block,
    flat_number,
    occupancy_type
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'resident'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role' = 'super_admin' OR NEW.raw_user_meta_data->>'status' = 'approved') THEN 'approved'
      ELSE 'pending'
    END,
    default_society_id,
    NEW.raw_user_meta_data->>'block',
    NEW.raw_user_meta_data->>'flat_number',
    NEW.raw_user_meta_data->>'occupancy_type'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    block = EXCLUDED.block,
    flat_number = EXCLUDED.flat_number,
    occupancy_type = EXCLUDED.occupancy_type,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 27. ROW LEVEL SECURITY (RLS) POLICIES (SAFE IDEMPOTENT CREATION)
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to ensure rerun safety
DROP POLICY IF EXISTS "Allow public read access to societies" ON public.societies;
DROP POLICY IF EXISTS "Allow full access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow full access for blocks" ON public.blocks;
DROP POLICY IF EXISTS "Allow full access for flats" ON public.flats;
DROP POLICY IF EXISTS "Allow full access for family_members" ON public.family_members;
DROP POLICY IF EXISTS "Allow full access for vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Allow full access for pets" ON public.pets;
DROP POLICY IF EXISTS "Allow full access for visitor_passes" ON public.visitor_passes;
DROP POLICY IF EXISTS "Allow full access for parking_slots" ON public.parking_slots;
DROP POLICY IF EXISTS "Allow full access for maintenance_bills" ON public.maintenance_bills;
DROP POLICY IF EXISTS "Allow full access for payments" ON public.payments;
DROP POLICY IF EXISTS "Allow full access for receipts" ON public.receipts;
DROP POLICY IF EXISTS "Allow full access for complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow full access for service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow full access for employee_tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Allow full access for attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow full access for leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow full access for events" ON public.events;
DROP POLICY IF EXISTS "Allow full access for announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow full access for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow full access for documents" ON public.documents;
DROP POLICY IF EXISTS "Allow full access for chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow full access for activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow full access for approval_events" ON public.approval_events;

-- Recreate policies cleanly
CREATE POLICY "Allow public read access to societies" ON public.societies FOR SELECT USING (true);
CREATE POLICY "Allow full access for profiles" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for blocks" ON public.blocks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for flats" ON public.flats FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for family_members" ON public.family_members FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for vehicles" ON public.vehicles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for pets" ON public.pets FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for visitor_passes" ON public.visitor_passes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for parking_slots" ON public.parking_slots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for maintenance_bills" ON public.maintenance_bills FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for payments" ON public.payments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for receipts" ON public.receipts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for complaints" ON public.complaints FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for service_requests" ON public.service_requests FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for employee_tasks" ON public.employee_tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for attendance" ON public.attendance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for leave_requests" ON public.leave_requests FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for events" ON public.events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for announcements" ON public.announcements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for notifications" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for documents" ON public.documents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for chat_messages" ON public.chat_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for activity_logs" ON public.activity_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow full access for approval_events" ON public.approval_events FOR ALL USING (auth.uid() IS NOT NULL);

-- 28. DEFAULT SEED DATA
INSERT INTO public.societies (name, code, address, city, state, pincode)
VALUES ('SocietySync Grand Residency', 'SSGR01', '100 Heritage Avenue, Green Park', 'Bengaluru', 'Karnataka', '560001')
ON CONFLICT (code) DO NOTHING;
