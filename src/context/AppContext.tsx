import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Profile,
  SavingsAccount,
  Contribution,
  Loan,
  Transaction,
  ToastMessage,
  UserRole,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_SAVINGS_ACCOUNTS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

interface AppContextType {
  currentUser: Profile;
  profiles: Profile[];
  savingsAccounts: SavingsAccount[];
  contributions: Contribution[];
  loans: Loan[];
  transactions: Transaction[];
  toasts: ToastMessage[];
  
  // Aggregated calculations
  totalCommunityFund: number;
  totalActiveLoans: number;
  availableLiquidity: number;
  pendingContributionsCount: number;
  pendingLoansCount: number;
  totalMembersCount: number;
  currentMemberSavings: SavingsAccount | undefined;
  currentMemberLoans: Loan[];
  currentMemberContributions: Contribution[];
  currentMemberTransactions: Transaction[];

  // User & Auth methods
  switchUser: (profileId: string) => void;
  login: (email: string) => boolean;
  signup: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    occupation?: string;
    nationalId?: string;
  }) => boolean;
  
  // Member actions
  addContribution: (data: {
    amount: number;
    payment_method: PaymentMethod;
    reference_code?: string;
    notes?: string;
  }) => void;
  applyLoan: (data: {
    amount_requested: number;
    duration_months: number;
    purpose: string;
    interest_rate?: number;
  }) => void;
  repayLoan: (loanId: string, amount: number) => void;

  // Admin actions
  approveContribution: (contributionId: string) => void;
  rejectContribution: (contributionId: string, reason?: string) => void;
  approveAndDisburseLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason?: string) => void;
  updateMemberProfile: (profileId: string, updates: Partial<Profile>) => void;
  addManualAdjustment: (
    profileId: string,
    amount: number,
    direction: 'credit' | 'debit',
    reason: string
  ) => void;
  
  // System actions
  resetToDefaultData: () => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILES: 'sacco_profiles_v1',
  SAVINGS: 'sacco_savings_v1',
  CONTRIBUTIONS: 'sacco_contributions_v1',
  LOANS: 'sacco_loans_v1',
  TRANSACTIONS: 'sacco_transactions_v1',
  CURRENT_USER_ID: 'sacco_current_user_id_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  // Savings Accounts
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_ACCOUNTS;
  });

  // Contributions
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
    return saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
  });

  // Loans
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Current logged in user (defaults to Kwame Mensah or saved user)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'prof-member-01';
  });

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsAccounts));
  }, [savingsAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: 'toast-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0] || INITIAL_PROFILES[0];

  // Calculations
  const totalCommunityFund = savingsAccounts.reduce((sum, s) => sum + Number(s.current_balance || 0), 0);
  const totalActiveLoans = loans
    .filter((l) => l.status === 'disbursed')
    .reduce((sum, l) => sum + Number(l.remaining_balance || 0), 0);
  const availableLiquidity = Math.max(0, totalCommunityFund - totalActiveLoans);
  const pendingContributionsCount = contributions.filter((c) => c.status === 'pending').length;
  const pendingLoansCount = loans.filter((l) => l.status === 'pending').length;
  const totalMembersCount = profiles.length;

  const currentMemberSavings = savingsAccounts.find((s) => s.profile_id === currentUser.id);
  const currentMemberLoans = loans.filter((l) => l.profile_id === currentUser.id);
  const currentMemberContributions = contributions.filter((c) => c.profile_id === currentUser.id);
  const currentMemberTransactions = transactions.filter((t) => t.profile_id === currentUser.id);

  // User Actions
  const switchUser = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setCurrentUserId(profileId);
      addToast({
        type: 'info',
        title: 'Switched Active Session',
        message: `Now operating as ${target.full_name} (${target.role.toUpperCase()})`,
      });
    }
  };

  const login = (email: string): boolean => {
    const target = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (target) {
      if (target.status === 'suspended') {
        addToast({
          type: 'error',
          title: 'Account Suspended',
          message: 'Your account is suspended. Please contact the SACCO Admin.',
        });
        return false;
      }
      setCurrentUserId(target.id);
      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: `Logged in as ${target.full_name}`,
      });
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: 'No account found with this email address.',
      });
      return false;
    }
  };

  const signup = (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    occupation?: string;
    nationalId?: string;
  }): boolean => {
    const existing = profiles.find((p) => p.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      addToast({
        type: 'error',
        title: 'Email Already Registered',
        message: 'An account with this email already exists. Please log in.',
      });
      return false;
    }

    const newProfileId = 'prof-' + Math.random().toString(36).substr(2, 9);
    const newProfile: Profile = {
      id: newProfileId,
      user_id: 'user-' + Math.random().toString(36).substr(2, 9),
      full_name: data.fullName,
      email: data.email.trim().toLowerCase(),
      phone_number: data.phoneNumber,
      role: 'member',
      status: 'active',
      occupation: data.occupation || 'Member',
      national_id: data.nationalId || `ID-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
    };

    const newSavings: SavingsAccount = {
      id: 'sav-' + Math.random().toString(36).substr(2, 9),
      profile_id: newProfileId,
      total_contributed: 0,
      current_balance: 0,
      updated_at: new Date().toISOString(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setSavingsAccounts((prev) => [...prev, newSavings]);
    setCurrentUserId(newProfileId);

    addToast({
      type: 'success',
      title: 'Welcome to the SACCO!',
      message: `Account created successfully for ${data.fullName}. You can now start logging contributions.`,
    });
    return true;
  };

  // Member Contribution
  const addContribution = (data: {
    amount: number;
    payment_method: PaymentMethod;
    reference_code?: string;
    notes?: string;
  }) => {
    const newContribution: Contribution = {
      id: 'cnt-' + Math.random().toString(36).substr(2, 9),
      profile_id: currentUser.id,
      amount: Number(data.amount),
      payment_method: data.payment_method,
      reference_code: data.reference_code || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending',
      notes: data.notes,
      submitted_at: new Date().toISOString(),
    };

    setContributions((prev) => [newContribution, ...prev]);

    addToast({
      type: 'success',
      title: 'Contribution Submitted',
      message: `Your deposit of $${data.amount.toLocaleString()} via ${data.payment_method} has been queued for admin verification.`,
    });
  };

  // Member Apply for Loan
  const applyLoan = (data: {
    amount_requested: number;
    duration_months: number;
    purpose: string;
    interest_rate?: number;
  }) => {
    const rate = data.interest_rate ?? 5; // 5% default
    const totalInterest = (data.amount_requested * rate) / 100;
    const totalPayable = data.amount_requested + totalInterest;
    const monthlyInstallment = totalPayable / data.duration_months;

    const newLoan: Loan = {
      id: 'loan-' + Math.random().toString(36).substr(2, 9),
      profile_id: currentUser.id,
      amount_requested: Number(data.amount_requested),
      interest_rate: rate,
      duration_months: Number(data.duration_months),
      total_payable: Number(totalPayable.toFixed(2)),
      remaining_balance: Number(totalPayable.toFixed(2)),
      monthly_installment: Number(monthlyInstallment.toFixed(2)),
      total_paid: 0,
      purpose: data.purpose,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setLoans((prev) => [newLoan, ...prev]);

    addToast({
      type: 'success',
      title: 'Loan Application Submitted',
      message: `Requested $${data.amount_requested.toLocaleString()} for ${data.duration_months} months. Sent to credit committee review.`,
    });
  };

  // Member Repay Loan
  const repayLoan = (loanId: string, amount: number) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const payAmount = Math.min(amount, targetLoan.remaining_balance);
    const newRemaining = Math.max(0, targetLoan.remaining_balance - payAmount);
    const newTotalPaid = targetLoan.total_paid + payAmount;
    const isFinished = newRemaining <= 0.01;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              remaining_balance: Number(newRemaining.toFixed(2)),
              total_paid: Number(newTotalPaid.toFixed(2)),
              status: isFinished ? 'completed' : l.status,
            }
          : l
      )
    );

    // Record repayment transaction
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      profile_id: targetLoan.profile_id,
      type: 'loan_repayment',
      amount: payAmount,
      direction: 'credit',
      description: `Loan repayment of $${payAmount.toLocaleString()} for loan #${targetLoan.id.slice(-6)}`,
      reference_id: loanId,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      type: 'success',
      title: isFinished ? 'Loan Fully Settled! 🎉' : 'Payment Recorded',
      message: isFinished
        ? `Congratulations! Loan #${targetLoan.id.slice(-6)} has been completely paid off.`
        : `Successfully repaid $${payAmount.toLocaleString()}. Remaining balance: $${newRemaining.toFixed(2)}`,
    });
  };

  // Admin Approve Contribution
  const approveContribution = (contributionId: string) => {
    const contribution = contributions.find((c) => c.id === contributionId);
    if (!contribution || contribution.status !== 'pending') return;

    const memberProfile = profiles.find((p) => p.id === contribution.profile_id);

    // 1. Mark contribution approved
    setContributions((prev) =>
      prev.map((c) =>
        c.id === contributionId
          ? { ...c, status: 'approved', approved_at: new Date().toISOString() }
          : c
      )
    );

    // 2. Credit member savings account
    setSavingsAccounts((prev) =>
      prev.map((s) => {
        if (s.profile_id === contribution.profile_id) {
          const newBal = Number(s.current_balance) + Number(contribution.amount);
          const newCont = Number(s.total_contributed) + Number(contribution.amount);
          return {
            ...s,
            current_balance: Number(newBal.toFixed(2)),
            total_contributed: Number(newCont.toFixed(2)),
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    // 3. Add to Global Transactions Ledger
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      profile_id: contribution.profile_id,
      type: 'contribution',
      amount: contribution.amount,
      direction: 'credit',
      description: `Approved contribution from ${memberProfile?.full_name || 'Member'} (${contribution.payment_method}) [Ref: ${contribution.reference_code || 'N/A'}]`,
      reference_id: contributionId,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      type: 'success',
      title: 'Contribution Approved & Credited',
      message: `Credited $${contribution.amount.toLocaleString()} to ${memberProfile?.full_name || 'member'}'s savings account.`,
    });
  };

  // Admin Reject Contribution
  const rejectContribution = (contributionId: string, reason?: string) => {
    const contribution = contributions.find((c) => c.id === contributionId);
    if (!contribution) return;

    const defaultReason = reason || 'Payment reference verification failed or incomplete transaction details.';

    setContributions((prev) =>
      prev.map((c) =>
        c.id === contributionId
          ? { ...c, status: 'rejected', rejection_reason: defaultReason }
          : c
      )
    );

    addToast({
      type: 'warning',
      title: 'Contribution Rejected',
      message: `Deposit of $${contribution.amount.toLocaleString()} was rejected. Reason logged for member.`,
    });
  };

  // Admin Approve & Disburse Loan
  const approveAndDisburseLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan || targetLoan.status !== 'pending') return;

    const memberProfile = profiles.find((p) => p.id === targetLoan.profile_id);

    // 1. Update loan status to disbursed
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'disbursed',
              approved_at: new Date().toISOString(),
              disbursed_at: new Date().toISOString(),
            }
          : l
      )
    );

    // 2. Add Debit to Ledger
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      profile_id: targetLoan.profile_id,
      type: 'loan_disbursement',
      amount: targetLoan.amount_requested,
      direction: 'debit',
      description: `Loan disbursement to ${memberProfile?.full_name || 'Member'} for "${targetLoan.purpose}"`,
      reference_id: loanId,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      type: 'success',
      title: 'Loan Approved & Disbursed',
      message: `Principal of $${targetLoan.amount_requested.toLocaleString()} disbursed to ${memberProfile?.full_name}. Active loan ledger updated.`,
    });
  };

  // Admin Reject Loan
  const rejectLoan = (loanId: string, reason?: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const defaultReason = reason || 'Credit committee assessment did not meet current liquidity and guarantee parameters.';

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, status: 'rejected', rejection_reason: defaultReason }
          : l
      )
    );

    addToast({
      type: 'warning',
      title: 'Loan Application Rejected',
      message: `Loan request of $${targetLoan.amount_requested.toLocaleString()} was declined.`,
    });
  };

  // Admin Update Member Profile
  const updateMemberProfile = (profileId: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
    addToast({
      type: 'success',
      title: 'Member Profile Updated',
      message: 'Profile records and access roles have been updated.',
    });
  };

  // Admin Manual Adjustment
  const addManualAdjustment = (
    profileId: string,
    amount: number,
    direction: 'credit' | 'debit',
    reason: string
  ) => {
    const memberProfile = profiles.find((p) => p.id === profileId);
    if (!memberProfile) return;

    // Adjust savings account
    setSavingsAccounts((prev) =>
      prev.map((s) => {
        if (s.profile_id === profileId) {
          const delta = direction === 'credit' ? amount : -amount;
          const newBal = Math.max(0, s.current_balance + delta);
          return {
            ...s,
            current_balance: Number(newBal.toFixed(2)),
            updated_at: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    // Log in ledger
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      profile_id: profileId,
      type: 'manual_adjustment',
      amount: amount,
      direction: direction,
      description: `Manual admin ${direction}: ${reason}`,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      type: 'info',
      title: 'Manual Balance Adjustment Applied',
      message: `${direction === 'credit' ? 'Added' : 'Deducted'} $${amount.toLocaleString()} for ${memberProfile.full_name}.`,
    });
  };

  // Reset to default seed data
  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
    localStorage.removeItem(STORAGE_KEYS.CONTRIBUTIONS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);

    setProfiles(INITIAL_PROFILES);
    setSavingsAccounts(INITIAL_SAVINGS_ACCOUNTS);
    setContributions(INITIAL_CONTRIBUTIONS);
    setLoans(INITIAL_LOANS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentUserId('prof-member-01');

    addToast({
      type: 'info',
      title: 'Reset Demo State',
      message: 'All balances, contributions, loans, and audit logs have been reset to factory seed data.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        savingsAccounts,
        contributions,
        loans,
        transactions,
        toasts,
        totalCommunityFund,
        totalActiveLoans,
        availableLiquidity,
        pendingContributionsCount,
        pendingLoansCount,
        totalMembersCount,
        currentMemberSavings,
        currentMemberLoans,
        currentMemberContributions,
        currentMemberTransactions,
        switchUser,
        login,
        signup,
        addContribution,
        applyLoan,
        repayLoan,
        approveContribution,
        rejectContribution,
        approveAndDisburseLoan,
        rejectLoan,
        updateMemberProfile,
        addManualAdjustment,
        resetToDefaultData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
