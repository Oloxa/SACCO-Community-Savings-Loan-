# SACCO & ROSCA Community Savings & Loan Platform

A production-ready Fintech MVP designed for **Savings and Credit Cooperative Organizations (SACCOs)** and **Rotating Savings and Credit Associations (ROSCAs)**. The platform enables community groups to pool savings, underwrite member credit, reconcile deposits, and track immutable financial ledger audits with strict Role-Based Access Control (RBAC).

---

## 🌟 Key Features

### 1. Member Operations (`/dashboard`)
- **Real-Time Savings Tracking**: View total personal contributions, current verified balance, and group pool share.
- **3x Collateralized Credit Limit**: Automated calculation of borrowing limits based on member savings balance.
- **Contribution Submission**: Log new deposit receipts (Bank Transfer, Mobile Money / M-Pesa, Cash, Cheque) with auto-generated reference codes and instant pending status.
- **Loan Request Lifecycle**: Interactive loan calculator with configurable terms, 5% flat interest calculation, repayment scheduling, and real-time collateral verification.
- **Loan Repayments**: Settle monthly installments or clear remaining loan balances with immediate ledger updates.
- **Personal Audit Trail**: Chronological history of all credits, debits, and disbursement events.

### 2. Admin & Treasury Console (`/admin`)
- **Executive Solvency Overview**: Live metrics for Total Community Fund, Active Loans Portfolio, Treasury Cash Liquidity, and Reserve Ratios.
- **Pending Approvals Queue**:
  - Review and verify incoming deposit receipts; one-click approval credits member balances and updates the ledger.
  - Credit committee loan underwriting with collateral ratio checks, purpose evaluation, and instant disbursement.
  - Rejection flows with structured feedback notes.
- **Member Directory & Profile Management**: Search, filter, toggle roles (`member` / `admin`), manage account status (`active` / `suspended`), and execute audited manual balance adjustments.
- **Global Financial Ledger**: Complete double-entry immutable audit trail with search, event filters, and **CSV / JSON export**.

### 3. Architecture & Database Schemas
- **PostgreSQL / Supabase Schema**: DDL with Row Level Security (RLS) policies enforcing multi-tenant and role-based data isolation.
- **Prisma ORM Models**: Complete schema definition for Next.js / Node.js backend integration.
- **In-App Schema Inspector**: View and copy production SQL DDL and Prisma configurations directly from the UI.

---

## 👥 Demo Profiles & RBAC

| Name | Role | Email | Status | Initial Savings |
|---|---|---|---|---|
| **Sarah Chen** | `admin` | `sarah.chen@sacco.org` | Active | $5,000.00 |
| **Kwame Mensah** | `member` | `kwame.mensah@example.com` | Active | $1,250.00 |
| **Elena Rostova** | `member` | `elena.rostova@example.com` | Active | $2,800.00 |
| **David Kim** | `member` | `david.kim@example.com` | Active | $450.00 |

*Use the profile switcher in the top navigation to toggle between admin and member accounts instantly.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Motion animations.
- **State Management**: React Context with LocalStorage persistence and seed state reset.
- **Typography**: Plus Jakarta Sans.
- **Build Tool**: Vite.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 📄 License
Apache-2.0
