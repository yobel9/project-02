-- ============================================
-- GerejaKu Admin - Supabase Database Schema
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: app_storage
-- ============================================
-- Stores application data synced between local and remote
CREATE TABLE IF NOT EXISTS app_storage (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_storage_updated_at ON app_storage(updated_at DESC);

-- ============================================
-- Table: church_users
-- ============================================
-- Application users (admins, staff)
CREATE TABLE IF NOT EXISTS church_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Should be hashed in production
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_church_users_username ON church_users(username);
CREATE INDEX IF NOT EXISTS idx_church_users_role ON church_users(role);
CREATE INDEX IF NOT EXISTS idx_church_users_status ON church_users(status);

-- ============================================
-- Table: church_members
-- ============================================
-- Church members database
CREATE TABLE IF NOT EXISTS church_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    birth_date DATE,
    birth_place TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    join_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    photo TEXT, -- URL to uploaded photo
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_members_name ON church_members(name);
CREATE INDEX IF NOT EXISTS idx_church_members_phone ON church_members(phone);
CREATE INDEX IF NOT EXISTS idx_church_members_status ON church_members(status);
CREATE INDEX IF NOT EXISTS idx_church_members_join_date ON church_members(join_date);

-- ============================================
-- Table: church_donations
-- ============================================
-- Donation records
CREATE TABLE IF NOT EXISTS church_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    donor_name TEXT NOT NULL,
    amount BIGINT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tithe', 'offering', 'building', 'special', 'other')),
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Transfer', 'Check', 'QRIS')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_donations_date ON church_donations(date DESC);
CREATE INDEX IF NOT EXISTS idx_church_donations_donor ON church_donations(donor_name);
CREATE INDEX IF NOT EXISTS idx_church_donations_category ON church_donations(category);

-- ============================================
-- Table: church_expenses
-- ============================================
-- Expense records
CREATE TABLE IF NOT EXISTS church_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    party_name TEXT NOT NULL,
    amount BIGINT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('utility', 'maintenance', 'salary', 'materials', 'other')),
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Transfer', 'Check')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_expenses_date ON church_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_church_expenses_party ON church_expenses(party_name);
CREATE INDEX IF NOT EXISTS idx_church_expenses_category ON church_expenses(category);

-- ============================================
-- Table: church_attendance
-- ============================================
-- Attendance records
CREATE TABLE IF NOT EXISTS church_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    service TEXT NOT NULL,
    present_members UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_attendance_date ON church_attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_church_attendance_service ON church_attendance(service);

-- ============================================
-- Table: church_events
-- ============================================
-- Church events
CREATE TABLE IF NOT EXISTS church_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    end_time TEXT,
    location TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('service', 'fellowship', 'practice', 'celebration', 'study', 'other')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    description TEXT,
    attendees UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_events_date ON church_events(date DESC);
CREATE INDEX IF NOT EXISTS idx_church_events_status ON church_events(status);
CREATE INDEX IF NOT EXISTS idx_church_events_category ON church_events(category);

-- ============================================
-- Table: church_structure
-- ============================================
-- Church board structure
CREATE TABLE IF NOT EXISTS church_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    periode_jabatan TEXT, -- e.g., "2024-2028"
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_structure_role ON church_structure(role);
CREATE INDEX IF NOT EXISTS idx_church_structure_name ON church_structure(name);

-- ============================================
-- Table: church_inventory
-- ============================================
-- Church inventory items
CREATE TABLE IF NOT EXISTS church_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('furniture', 'electronic', 'music', 'materials', 'other')),
    quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'unit',
    condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'poor', 'minor_damage', 'needs_repair')),
    location TEXT,
    acquired_date DATE,
    value BIGINT DEFAULT 0,
    photo TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_inventory_name ON church_inventory(name);
CREATE INDEX IF NOT EXISTS idx_church_inventory_category ON church_inventory(category);
CREATE INDEX IF NOT EXISTS idx_church_inventory_location ON church_inventory(location);

-- ============================================
-- Table: church_announcements
-- ============================================
-- Church announcements
CREATE TABLE IF NOT EXISTS church_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'service', 'youth', 'family', 'other')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_announcements_date ON church_announcements(date DESC);
CREATE INDEX IF NOT EXISTS idx_church_announcements_status ON church_announcements(status);
CREATE INDEX IF NOT EXISTS idx_church_announcements_type ON church_announcements(type);

-- ============================================
-- Table: church_worship_schedules
-- ============================================
-- Worship service schedules
CREATE TABLE IF NOT EXISTS church_worship_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('routine', 'flexible')),
    day_of_week TEXT, -- 'Sunday', 'Monday', etc. or empty for flexible
    date DATE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT NOT NULL,
    recurrence_note TEXT,
    invitation_note TEXT,
    service_details TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_worship_day_of_week ON church_worship_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_church_worship_date ON church_worship_schedules(date);

-- ============================================
-- Table: church_activities
-- ============================================
-- Activity log
CREATE TABLE IF NOT EXISTS church_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('member', 'donation', 'event', 'expense', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_church_activities_type ON church_activities(type);
CREATE INDEX IF NOT EXISTS idx_church_activities_created_at ON church_activities(created_at DESC);

-- ============================================
-- Table: chat_messages
-- ============================================
-- Internal chat messages between users and admin
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================
-- Table: user_status
-- ============================================
-- Track online/offline status of users
CREATE TABLE IF NOT EXISTS user_status (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT false
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE app_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_worship_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- app_storage Policies
-- ============================================
CREATE POLICY "Enable all operations for authenticated users"
ON app_storage
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all operations for service_role"
ON app_storage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- church_users Policies
-- ============================================
CREATE POLICY "Authenticated users can view all users"
ON church_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert users"
ON church_users
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
ON church_users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
ON church_users
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_members Policies
-- ============================================
CREATE POLICY "Authenticated users can view all members"
ON church_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert members"
ON church_members
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
ON church_members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete members"
ON church_members
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_donations Policies
-- ============================================
CREATE POLICY "Authenticated users can view all donations"
ON church_donations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert donations"
ON church_donations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update donations"
ON church_donations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete donations"
ON church_donations
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_expenses Policies
-- ============================================
CREATE POLICY "Authenticated users can view all expenses"
ON church_expenses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert expenses"
ON church_expenses
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
ON church_expenses
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete expenses"
ON church_expenses
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_attendance Policies
-- ============================================
CREATE POLICY "Authenticated users can view all attendance"
ON church_attendance
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert attendance"
ON church_attendance
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
ON church_attendance
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
ON church_attendance
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_events Policies
-- ============================================
CREATE POLICY "Authenticated users can view all events"
ON church_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert events"
ON church_events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
ON church_events
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
ON church_events
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_structure Policies
-- ============================================
CREATE POLICY "Authenticated users can view all structure"
ON church_structure
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert structure"
ON church_structure
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update structure"
ON church_structure
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete structure"
ON church_structure
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_inventory Policies
-- ============================================
CREATE POLICY "Authenticated users can view all inventory"
ON church_inventory
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert inventory"
ON church_inventory
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
ON church_inventory
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete inventory"
ON church_inventory
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_announcements Policies
-- ============================================
CREATE POLICY "Authenticated users can view all announcements"
ON church_announcements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert announcements"
ON church_announcements
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcements"
ON church_announcements
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete announcements"
ON church_announcements
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_worship_schedules Policies
-- ============================================
CREATE POLICY "Authenticated users can view all worship schedules"
ON church_worship_schedules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert worship schedules"
ON church_worship_schedules
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update worship schedules"
ON church_worship_schedules
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete worship schedules"
ON church_worship_schedules
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- church_activities Policies
-- ============================================
CREATE POLICY "Authenticated users can view all activities"
ON church_activities
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert activities"
ON church_activities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- chat_messages Policies
-- ============================================
CREATE POLICY "Enable all operations for chat_messages"
ON chat_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- user_status Policies
-- ============================================
CREATE POLICY "Enable all operations for user_status"
ON user_status
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- Trigger for updated_at timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables that need it
CREATE TRIGGER update_church_users_updated_at BEFORE UPDATE ON church_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_members_updated_at BEFORE UPDATE ON church_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_events_updated_at BEFORE UPDATE ON church_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_structure_updated_at BEFORE UPDATE ON church_structure
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_inventory_updated_at BEFORE UPDATE ON church_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_announcements_updated_at BEFORE UPDATE ON church_announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_worship_schedules_updated_at BEFORE UPDATE ON church_worship_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- Sample admin user (password: admin123 - should be hashed in production)
INSERT INTO church_users (username, password, name, role, status)
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY7h8W5qG5O', 'Administrator', 'admin', 'active')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Schema Complete
-- ============================================
