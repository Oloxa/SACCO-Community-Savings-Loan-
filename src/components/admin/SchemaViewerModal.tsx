import React, { useState } from 'react';
import { Database, Code2, Copy, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface SchemaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_CONTENT = `-- PostgreSQL / Supabase Schema with Row Level Security (RLS)
CREATE TYPE user_role_enum AS ENUM ('member', 'admin');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended');
CREATE TYPE contribution_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE loan_status_enum AS ENUM ('pending', 'approved', 'rejected', 'disbursed', 'completed');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'member',
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    total_contributed NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    reference_code TEXT,
    status contribution_status_enum NOT NULL DEFAULT 'pending',
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_requested NUMERIC(14, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    duration_months INTEGER NOT NULL,
    total_payable NUMERIC(14, 2) NOT NULL,
    remaining_balance NUMERIC(14, 2) NOT NULL,
    purpose TEXT NOT NULL,
    status loan_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    direction TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Security Rule Example
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view own profile, admins view all" ON profiles
    FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));`;

const PRISMA_CONTENT = `// Prisma Schema Definition
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  member
  admin
}

enum ContributionStatus {
  pending
  approved
  rejected
}

enum LoanStatus {
  pending
  approved
  rejected
  disbursed
  completed
}

model Profile {
  id           String     @id @default(uuid()) @db.Uuid
  userId       String     @unique @map("user_id") @db.Uuid
  fullName     String     @map("full_name")
  email        String     @unique
  phoneNumber  String     @map("phone_number")
  role         UserRole   @default(member)
  status       String     @default("active")
  createdAt    DateTime   @default(now()) @map("created_at")

  savingsAccount SavingsAccount?
  contributions  Contribution[]
  loans          Loan[]
  transactions   Transaction[]
}

model SavingsAccount {
  id               String   @id @default(uuid()) @db.Uuid
  profileId        String   @unique @map("profile_id") @db.Uuid
  totalContributed Decimal  @default(0.00) @map("total_contributed") @db.Decimal(14, 2)
  currentBalance   Decimal  @default(0.00) @map("current_balance") @db.Decimal(14, 2)
  updatedAt        DateTime @updatedAt @map("updated_at")

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}`;

export const SchemaViewerModal: React.FC<SchemaViewerModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'sql' | 'prisma'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = tab === 'sql' ? SQL_CONTENT : PRISMA_CONTENT;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-slate-900 text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">PostgreSQL / Supabase & Prisma DDL Schema</h3>
              <p className="text-xs text-slate-400">Complete production relational schema with RLS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Copy bar */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('sql')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                tab === 'sql' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              PostgreSQL / Supabase SQL
            </button>
            <button
              onClick={() => setTab('prisma')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                tab === 'prisma' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Prisma ORM Schema
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code view */}
        <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-300 leading-relaxed bg-slate-900">
          <pre className="whitespace-pre-wrap">{tab === 'sql' ? SQL_CONTENT : PRISMA_CONTENT}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
