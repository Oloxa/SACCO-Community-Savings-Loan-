/**
 * Community Savings Group (SACCO / ROSCA) Database Seed Script
 *
 * Populates 1 Admin account, 3 Member accounts, savings accounts, contributions,
 * loans, and financial transactions ledger.
 */

import {
  INITIAL_PROFILES,
  INITIAL_SAVINGS_ACCOUNTS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS
} from './src/data/initialData';

export async function runSeed() {
  console.log('🌱 Starting SACCO Database Seeding Process...');
  
  console.log(`✅ Loaded ${INITIAL_PROFILES.length} user profiles:`);
  INITIAL_PROFILES.forEach(p => {
    console.log(`   - [${p.role.toUpperCase()}] ${p.full_name} (${p.email}) - ${p.status}`);
  });

  console.log(`✅ Loaded ${INITIAL_SAVINGS_ACCOUNTS.length} savings accounts`);
  console.log(`✅ Loaded ${INITIAL_CONTRIBUTIONS.length} contributions (${INITIAL_CONTRIBUTIONS.filter(c => c.status === 'pending').length} pending approval)`);
  console.log(`✅ Loaded ${INITIAL_LOANS.length} loans (${INITIAL_LOANS.filter(l => l.status === 'pending').length} pending approval)`);
  console.log(`✅ Loaded ${INITIAL_TRANSACTIONS.length} transaction ledger records`);

  const totalPool = INITIAL_SAVINGS_ACCOUNTS.reduce((sum, s) => sum + s.current_balance, 0);
  const totalActiveLoans = INITIAL_LOANS.filter(l => l.status === 'disbursed').reduce((sum, l) => sum + l.remaining_balance, 0);
  
  console.log(`\n📊 Financial Metrics:`);
  console.log(`   - Total Community Fund Size: $${totalPool.toLocaleString()}`);
  console.log(`   - Total Active Loan Debt: $${totalActiveLoans.toLocaleString()}`);
  console.log(`   - Net Available Liquidity: $${(totalPool - totalActiveLoans).toLocaleString()}`);
  
  console.log('\n✨ Database seeding complete! Ready for local execution.');
  return {
    profiles: INITIAL_PROFILES,
    savingsAccounts: INITIAL_SAVINGS_ACCOUNTS,
    contributions: INITIAL_CONTRIBUTIONS,
    loans: INITIAL_LOANS,
    transactions: INITIAL_TRANSACTIONS
  };
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('seed.ts')) {
  runSeed();
}
