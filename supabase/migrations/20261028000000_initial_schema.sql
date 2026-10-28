-- Prime OS Phase 2: Core Database Schema, Multi-Tenant Workspace Model & RLS Policies
-- Target: Supabase (PostgreSQL 15+)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  active_workspace_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Workspaces Table (Tenant Container)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  slug TEXT NOT NULL UNIQUE CHECK (char_length(trim(slug)) >= 3),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Foreign Key: profiles -> workspaces
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS fk_profiles_active_workspace,
  ADD CONSTRAINT fk_profiles_active_workspace 
  FOREIGN KEY (active_workspace_id) 
  REFERENCES public.workspaces(id) 
  ON DELETE SET NULL;

-- 3. Workspace Members Table (Multi-Tenant Association & Roles)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_workspace_member UNIQUE (workspace_id, user_id)
);

-- 4. Leads Table (Core Acquisition Record)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL CHECK (char_length(trim(business_name)) > 0),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  category TEXT,
  address TEXT,
  city TEXT,
  rating NUMERIC(3, 2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  google_maps_url TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
    'New', 'Contacted', 'Interested', 'Follow-up', 'Meeting', 'Proposal', 'Won', 'Lost'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==========================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY ACCESS HELPERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_workspace_access(_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_workspace_id UUID, _roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = (SELECT auth.uid())
      AND role = ANY(_roles)
  );
$$;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile and profiles of members in the same workspace
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.workspace_members m1
      JOIN public.workspace_members m2 ON m1.workspace_id = m2.workspace_id
      WHERE m1.user_id = (SELECT auth.uid())
        AND m2.user_id = profiles.id
    )
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Workspaces: Read allowed for members, insert for authenticated, update for owner/admin
DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;
CREATE POLICY "workspaces_select_policy" ON public.workspaces
  FOR SELECT TO authenticated
  USING (has_workspace_access(id));

DROP POLICY IF EXISTS "workspaces_insert_policy" ON public.workspaces;
CREATE POLICY "workspaces_insert_policy" ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "workspaces_update_policy" ON public.workspaces;
CREATE POLICY "workspaces_update_policy" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (has_workspace_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (has_workspace_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "workspaces_delete_policy" ON public.workspaces;
CREATE POLICY "workspaces_delete_policy" ON public.workspaces
  FOR DELETE TO authenticated
  USING (has_workspace_role(id, ARRAY['owner']));

-- Workspace Members: Read for workspace members, write for owners/admins
DROP POLICY IF EXISTS "members_select_policy" ON public.workspace_members;
CREATE POLICY "members_select_policy" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "members_insert_policy" ON public.workspace_members;
CREATE POLICY "members_insert_policy" ON public.workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (has_workspace_role(workspace_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "members_update_policy" ON public.workspace_members;
CREATE POLICY "members_update_policy" ON public.workspace_members
  FOR UPDATE TO authenticated
  USING (has_workspace_role(workspace_id, ARRAY['owner']))
  WITH CHECK (has_workspace_role(workspace_id, ARRAY['owner']));

DROP POLICY IF EXISTS "members_delete_policy" ON public.workspace_members;
CREATE POLICY "members_delete_policy" ON public.workspace_members
  FOR DELETE TO authenticated
  USING (
    has_workspace_role(workspace_id, ARRAY['owner', 'admin'])
    OR user_id = (SELECT auth.uid())
  );

-- Leads: Strict tenant isolation for all CRUD operations
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT TO authenticated
  USING (has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE TO authenticated
  USING (has_workspace_access(workspace_id))
  WITH CHECK (has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE TO authenticated
  USING (has_workspace_access(workspace_id));

-- ==========================================
-- TENANT TAMPERING PREVENTION TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.prevent_lead_workspace_reassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
    RAISE EXCEPTION 'Security Violation: Modifying workspace_id on an existing lead is forbidden.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_lead_workspace_reassignment ON public.leads;
CREATE TRIGGER trg_prevent_lead_workspace_reassignment
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.prevent_lead_workspace_reassignment();

-- ==========================================
-- HIGH-PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_leads_ws_status_created ON public.leads (workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ws_created ON public.leads (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ws_priority_created ON public.leads (workspace_id, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ws_city ON public.leads (workspace_id, city);
CREATE INDEX IF NOT EXISTS idx_leads_ws_category ON public.leads (workspace_id, category);
CREATE INDEX IF NOT EXISTS idx_leads_ws_phone ON public.leads (workspace_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_ws_email ON public.leads (workspace_id, email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_business_name_trgm ON public.leads USING gin (business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_members_user_ws ON public.workspace_members (user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_members_ws ON public.workspace_members (workspace_id);

-- ==========================================
-- IDEMPOTENT USER & WORKSPACE BOOTSTRAP TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_workspace_name TEXT;
  v_slug TEXT;
BEGIN
  -- 1. Ensure user profile exists
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  -- 2. Check if user already joined a workspace (e.g., via invitation)
  SELECT workspace_id INTO v_workspace_id
  FROM public.workspace_members
  WHERE user_id = NEW.id
  LIMIT 1;

  -- 3. If no existing workspace, provision default agency workspace
  IF v_workspace_id IS NULL THEN
    v_workspace_name := COALESCE(
      NEW.raw_user_meta_data->>'workspace_name', 
      split_part(NEW.email, '@', 1) || '''s Agency'
    );
    
    v_slug := lower(regexp_replace(v_workspace_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(NEW.id::text, 1, 6);

    INSERT INTO public.workspaces (name, slug, created_by)
    VALUES (v_workspace_name, v_slug, NEW.id)
    RETURNING id INTO v_workspace_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, NEW.id, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- 4. Set active workspace in profile
  UPDATE public.profiles
  SET active_workspace_id = v_workspace_id
  WHERE id = NEW.id AND (active_workspace_id IS NULL OR active_workspace_id = v_workspace_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user warning: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

