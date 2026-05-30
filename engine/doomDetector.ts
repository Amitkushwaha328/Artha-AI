import { Transaction } from '../db/queries';

export interface DoomResult {
  isDoom:      boolean;
  count:       number;
  total:       number;
  merchants:   string[];
  severity:    'none' | 'mild' | 'high';
}

export function detectDoom(txns: Transaction[]): DoomResult {
  // Filter micro-transactions (under ₹800)
  const micro = txns.filter(t => t.amount < 800);

  const total     = micro.reduce((s, t) => s + t.amount, 0);
  const merchants = [...new Set(micro.map(t => t.merchant).filter(Boolean))];

  const isDoom   = micro.length >= 4;
  const severity =
    micro.length >= 7 ? 'high' :
    micro.length >= 4 ? 'mild' : 'none';

  return {
    isDoom,
    count:     micro.length,
    total:     Math.round(total),
    merchants: merchants.slice(0, 5),
    severity,
  };
}