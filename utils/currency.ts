// Format a number as Indian Rupees
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

// Format compact (₹1.2L, ₹45K)
export function formatCompactINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}
