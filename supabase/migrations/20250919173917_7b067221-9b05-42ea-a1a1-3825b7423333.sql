-- Remove email column from profiles table to fix security issue
-- Email addresses are already available from auth.users, no need to duplicate them

-- Update the create_profile_for_user function to not insert email
DROP FUNCTION IF EXISTS public.create_profile_for_user();

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_user();

-- Remove the email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;