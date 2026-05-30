import { Profile, Bill, Transaction } from '../db/queries';

export interface STSResult {
  safeAmount:       number;  // ← THE NUMBER shown on home screen
  currentBalance:   number;
  reservedForBills: number;  // bills still due this cycle
  spentSoFar:       number;  // debits this month
  safetyBuffer:     number;  // 5% of income
  percentUsed:      number;  // 0–100, for progress bar
  dailyBudget:      number;  // safe / days remaining
  daysLeft:         number;
}

export function calcSTS(
  profile: Profile,
  bills: Bill[],
  txns: Transaction[]
): STSResult {
  const today = new Date();
  const dayOfMonth  = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - dayOfMonth);

  // Bills still due AFTER today in this cycle
  const reservedForBills = bills
    .filter(b => b.due_day > dayOfMonth)
    .reduce((s, b) => s + b.amount, 0);

  // What was already spent this month (debits only)
  const spentSoFar = txns
    .filter(t => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  // Safety buffer — minimum ₹2,000 or 5% of income
  const safetyBuffer = Math.max(
    2000,
    profile.monthly_income * (profile.safety_pct / 100)
  );

  // Core formula
  const safeAmount = Math.max(0,
    profile.current_balance - reservedForBills - safetyBuffer
  );

  // Progress: how much of the 'spendable pool' is used
  const spendablePool = Math.max(1,
    profile.monthly_income - reservedForBills - safetyBuffer
  );
  const percentUsed = Math.min(100,
    (spentSoFar / spendablePool) * 100
  );

  return {
    safeAmount:       Math.round(safeAmount),
    currentBalance:   Math.round(profile.current_balance),
    reservedForBills: Math.round(reservedForBills),
    spentSoFar:       Math.round(spentSoFar),
    safetyBuffer:     Math.round(safetyBuffer),
    percentUsed:      Math.round(percentUsed),
    dailyBudget:      Math.round(safeAmount / daysLeft),
    daysLeft,
  };
}