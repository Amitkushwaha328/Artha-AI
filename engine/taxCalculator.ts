// India New Tax Regime (FY 2025-26)
// Q1: 15% of annual tax due by June 15
// Q2: 45% cumulative by Sep 15
// Q3: 75% cumulative by Dec 15
// Q4: 100% by March 15
export function calcAdvanceTax(projectedAnnualIncome: number) {
  // New regime slabs 2025-26
  const tax =
    projectedAnnualIncome <= 700000  ? 0 :          // Rebate u/s 87A
    projectedAnnualIncome <= 1000000 ? (projectedAnnualIncome - 700000) * 0.1 :
    projectedAnnualIncome <= 1200000 ? 30000 + (projectedAnnualIncome - 1000000) * 0.15 :
    projectedAnnualIncome <= 1500000 ? 60000 + (projectedAnnualIncome - 1200000) * 0.2 :
    120000 + (projectedAnnualIncome - 1500000) * 0.3;

  return {
    annualTax: Math.round(tax),
    q1Due: Math.round(tax * 0.15),   // June 15
    q2Due: Math.round(tax * 0.45),   // Sep 15 (cumulative)
    q3Due: Math.round(tax * 0.75),   // Dec 15 (cumulative)
    q4Due: Math.round(tax * 1.0),    // Mar 15 (cumulative)
    monthlyReserve: Math.round(tax / 12), // auto-save this per month
  };
}
