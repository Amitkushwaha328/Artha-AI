export interface UserProfile {
  hasJanDhanAccount: boolean;
  age: number;
  hasPension: boolean;
  incomeMonthly: number;
  city: string;
  state: string;
  isFreelancer: boolean;
}

export function matchSchemes(profile: UserProfile) {
  const matched = [];

  if (profile.hasJanDhanAccount) {
    matched.push({ id: 'PMJDY', benefit: '₹10,000 overdraft + ₹2L insurance', name: 'Pradhan Mantri Jan Dhan Yojana' });
  }

  if (profile.age < 40 && !profile.hasPension) {
    matched.push({ id: 'APY', benefit: '₹210/mo → ₹5,000/mo pension at 60', name: 'Atal Pension Yojana' });
  }

  if (profile.incomeMonthly < 50000 && profile.city === 'Hyderabad') {
    matched.push({ id: 'PMAY-U', benefit: 'Up to ₹2.67L home loan subsidy', name: 'PM Awas Yojana (Urban)' });
  }

  if (profile.isFreelancer) {
    matched.push({ id: 'DPIIT', benefit: '3-year income tax exemption on profits', name: 'Startup India DPIIT' });
  }

  if (profile.state === 'Gujarat') {
    matched.push({ id: 'MMGY', benefit: '3% lower home loan + ₹15L subsidy', name: 'Mukhyamantri Gruh Yojana' });
  }

  return matched;
}
