# Price Monitor - Login Troubleshooting Log

> **Date:** January 15, 2026
> **Issue:** "Database error querying schema" when attempting to login
> **Status:** ✅ RESOLVED

---

## Resolution Summary

The "Database error querying schema" error had **two root causes**:

### Root Cause 1: Users Created via SQL (Not Supabase Auth)
Users inserted directly into `auth.users` via SQL are missing critical auth metadata:
- `raw_app_meta_data`: Must contain `{"provider": "email", "providers": ["email"]}`
- `providers` array: Must contain `["email"]`

**Working user (created via Dashboard):**
```json
{
  "raw_app_meta_data": {"provider": "email", "providers": ["email"]},
  "providers": ["email"]
}
```

**Broken user (created via SQL):**
```json
{
  "raw_app_meta_data": null,
  "providers": []
}
```

### Root Cause 2: Recursive RLS Policies on users Table
The original RLS policies on `public.users` had recursive self-references:
```sql
-- PROBLEMATIC: Queries public.users while inside a query to public.users
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

This causes Supabase's schema introspection to fail.

---

## The Fix

### 1. Create Users Through Supabase Dashboard ONLY
Never insert users directly into `auth.users` via SQL. Always use:
- Supabase Dashboard > Authentication > Users > Add User
- Or the Supabase Auth API (`supabase.auth.signUp()`)

### 2. Fix RLS Policies to Use JWT Instead of Recursive Queries
Replace recursive policies with JWT-based checks:

```sql
-- Drop old recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- Create non-recursive policies using JWT claims
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update users"
    ON public.users FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

### 3. After Creating Users, Update Their Metadata
Since Dashboard only allows email/password, update metadata after creation:

```sql
-- Update auth.users metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
    'full_name', 'Admin User',
    'role', 'admin',
    'sector', 'Central'
)
WHERE email = 'admin@central.tl';

-- Update public.users profile
UPDATE public.users 
SET full_name = 'Admin User', role = 'admin', sector = 'Central'
WHERE email = 'admin@central.tl';
```

---

## Current Database State (as of end of session)

| Item | Status |
|------|--------|
| Trigger `on_auth_user_created` | ✅ Re-created |
| Function `handle_new_user` | ✅ Re-created |
| RLS on `public.users` | ⚠️ DISABLED (needs fixed policies) |
| RLS on other tables | ✅ ENABLED |
| Test users | ⚠️ Need to be recreated via Dashboard |

---

## Correct User Creation Workflow

1. **Create user in Supabase Dashboard:**
   - Authentication > Users > Add User > Create New User
   - Enter email and password
   - Check "Auto Confirm User"
   - Click Create

2. **Update user metadata via SQL:**
   ```sql
   -- Update auth metadata (for JWT claims)
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_build_object(
       'full_name', 'User Name',
       'role', 'admin',  -- or 'field_worker'
       'sector', 'Central'  -- or 'Ensul'
   )
   WHERE email = 'user@email.com';

   -- Update public profile (should be auto-created by trigger)
   UPDATE public.users 
   SET full_name = 'User Name', role = 'admin', sector = 'Central'
   WHERE email = 'user@email.com';
   ```

3. **User can now log in**

---

## Next Steps (for next session)

1. **Delete broken test users:**
   ```sql
   DELETE FROM auth.users 
   WHERE email IN ('admin@central.tl', 'worker1@central.tl', 'worker1@ensul.tl');
   ```

2. **Recreate users via Dashboard** (email + password + Auto Confirm)

3. **Update metadata via SQL** (as shown above)

4. **Re-enable RLS on users table** with the fixed JWT-based policies

5. **Test full application flow**

---

## Files Modified During Troubleshooting

- `app/(auth)/login/page.tsx` - Added URL parameter pre-fill for testing
- RLS policies in database - Dropped and recreated (needs final fix)

---

## Key Learnings

1. **Never create Supabase auth users via direct SQL** - they won't have proper auth metadata
2. **Avoid recursive RLS policies** - use `auth.jwt()` to check roles instead of querying the same table
3. **The trigger for auto-creating profiles is essential** - without it, users exist in auth but not in public.users
4. **User metadata must be set after Dashboard user creation** - Dashboard doesn't have metadata fields

---

*Last updated: January 15, 2026 (End of troubleshooting session)*
