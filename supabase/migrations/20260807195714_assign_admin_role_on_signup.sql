/*
# Auto-assign admin role to the owner email on signup

1. Purpose
   - Ensures that sufiyanabdullah630@gmail.com automatically gets role='admin'
     in the profiles table when they sign up, so they are redirected to /admin
     instead of /dashboard after login.
2. Changes
   - Updates the handle_new_user trigger function to check the new user's email
     and assign 'admin' role if it matches the owner email, otherwise 'student'.
3. Security
   - No new tables or policies. The trigger function is SECURITY DEFINER and
     already has EXECUTE revoked from anon/authenticated, so only the database
     can invoke it during signup.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'sufiyanabdullah630@gmail.com' THEN 'admin' ELSE 'student' END
  );
  RETURN NEW;
END;
$$;

-- Revoke execution from public roles (security best practice)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
