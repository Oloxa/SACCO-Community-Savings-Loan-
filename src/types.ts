export type UserRole = 'member' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'completed';
export type PaymentMethod = 'Bank Transfer' | 'Mobile Money' | 'M-Pesa' | 'Cash' | 'Cheque';
export type TransactionType = 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'manual_adjustment' | 'dividend_payout';
export type TransactionDirection = 'credit' | 'debit';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  occupation?: string;
  national_id?: string;
}

export interface SavingsAccount {
  id: string;
  profile_id: string;
  total_contributed: number;
  current_balance: number;
  updated_at: string;
}

export interface Contribution {
  id: string;
  profile_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_code?: string;
  status: ContributionStatus;
  notes?: string;
  submitted_at: string;
  approved_at?: string;
  rejection_reason?: string;
  receipt_url?: string;
}

export interface Loan {
  id: string;
  profile_id: string;
  amount_requested: number;
  interest_rate: number; // e.g. 5 for 5%
  duration_months: number;
  total_payable: number;
  remaining_balance: number;
  purpose: string;
  status: LoanStatus;
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  rejection_reason?: string;
  monthly_installment: number;
  total_paid: number;
}

export interface Transaction {
  id: string;
  profile_id: string;
  type: TransactionType;
  amount: number;
  direction: TransactionDirection;
  description: string;
  created_at: string;
  reference_id?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}
