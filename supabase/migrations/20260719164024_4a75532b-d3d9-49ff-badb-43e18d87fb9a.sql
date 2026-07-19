
-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'student';

-- Prevent users from escalating their own role: restrict UPDATE to safe columns only
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, email) ON public.profiles TO authenticated;

-- Update signup trigger to write role into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill role for existing rows from user_roles if present
UPDATE public.profiles p
SET role = 'admin'
WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin');

-- Ensure known admin account is set
UPDATE public.profiles SET role = 'admin'
WHERE email = 'sufiyanabdullah630@gmail.com';
