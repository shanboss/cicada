# Profiles Table RLS Setup

## Fix Row-Level Security Policy for Profiles Table

Run this SQL in your Supabase SQL Editor to allow users to insert and manage their own profiles:

```sql
-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON profiles
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Notes

- The `auth.uid()` function returns the UUID of the currently authenticated user
- The `WITH CHECK` clause ensures that users can only insert/update rows where the `id` matches their own user ID
- The service role policy allows server-side operations (like webhooks) to access all profiles

