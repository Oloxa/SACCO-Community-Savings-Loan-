-- ==============================================================================
-- COMMUNITY SAVINGS & LOAN SACCO / ROSCA DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
CREATE TYPE user_role_enum AS ENUM ('member', 'admin');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended');
CREATE TYPE contribution_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE loan_status_enum AS ENUM ('pending', 'approved', 'rejected', 'disbursed', 'completed');
CREATE TYPE transaction_type_enum AS ENUM ('contribution', 'loan_disbursement', 'loan_repayment', 'manual_adjustment', 'dividend_payout');
CREATE TYPE transaction_direction_enum AS ENUM ('credit', 'debit');

-- 2. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'member',
    status user_status_enum NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    occupation TEXT,
    national_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Savings Accounts Table
CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    total_contributed NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_contributed >= 0),
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_balance >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Contributions Table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    reference_code TEXT,
    status contribution_status_enum NOT NULL DEFAULT 'pending',
    notes TEXT,
    receipt_url TEXT,
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Loans Table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_requested NUMERIC(14, 2) NOT NULL CHECK (amount_requested > 0),
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (interest_rate >= 0),
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    total_payable NUMERIC(14, 2) NOT NULL,
    remaining_balance NUMERIC(14, 2) NOT NULL CHECK (remaining_balance >= 0),
    monthly_installment NUMERIC(14, 2) NOT NULL,
    total_paid NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    purpose TEXT NOT NULL,
    status loan_status_enum NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Transactions (Ledger) Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type transaction_type_enum NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    direction transaction_direction_enum NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indexes for Query Performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_savings_accounts_profile_id ON savings_accounts(profile_id);
CREATE INDEX idx_contributions_profile_id ON contributions(profile_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_loans_profile_id ON loans(profile_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_transactions_profile_id ON transactions(profile_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if auth user is Admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid AND role = 'admin' AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Members view own, Admins view all
CREATE POLICY "Users can view own profile or admins view all" ON profiles
    FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (is_admin(auth.uid()));

-- Savings Accounts: Members view own, Admins view/update all
CREATE POLICY "Users can view own savings" ON savings_accounts
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Admins can manage savings" ON savings_accounts
    FOR ALL USING (is_admin(auth.uid()));

-- Contributions: Members can insert own and view own; Admins can view/update all
CREATE POLICY "Members can view own contributions" ON contributions
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Members can submit contributions" ON contributions
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can update contribution status" ON contributions
    FOR UPDATE USING (is_admin(auth.uid()));

-- Loans: Members can view and request own; Admins can review/manage
CREATE POLICY "Members can view own loans" ON loans
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Members can request loans" ON loans
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage loans" ON loans
    FOR UPDATE USING (is_admin(auth.uid()));

-- Transactions: Members view own ledger; Admins view all global ledger
CREATE POLICY "Members can view own transactions" ON transactions
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Admins can view and insert transactions" ON transactions
    FOR ALL USING (is_admin(auth.uid()));
