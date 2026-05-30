import * as queries from '../db/queries';
import { calcSTS, STSResult } from '../engine/safeToSpend';
import { buildDangerWindow, DangerSummary } from '../engine/dangerWindow';
import { detectDoom, DoomResult } from '../engine/doomDetector';
export * from '../db/queries'; // Re-export types like Profile, Transaction, etc.
export { STSResult, DangerSummary, DoomResult };

/**
 * API Abstraction Layer
 * 
 * Currently this wraps the local SQLite database queries.
 * Once the backend is ready, these functions will be replaced
 * with fetch/axios calls to the remote REST API, keeping the
 * UI components unaware of the underlying data source.
 */

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      // Mock API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'test@example.com' && password === 'password') {
            resolve({ token: 'mock-jwt-token-123', user: { id: 1, name: 'You', email } });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1000);
      });
    },
    register: async (email: string, password: string, name: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ token: 'mock-jwt-token-new', user: { id: 2, name, email } });
        }, 1000);
      });
    },
    verifyToken: async (token: string) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (token) resolve({ valid: true, user: { id: 1, name: 'You' } });
          else reject(new Error('Invalid token'));
        }, 500);
      });
    },
  },
  profile: {
    get: queries.getProfile,
    update: queries.updateProfile,
  },
  transactions: {
    getThisMonth: queries.getTxnsThisMonth,
    getLast48h: queries.getTxnsLast48h,
    getCategoryTotals: queries.getCategoryTotals,
    add: queries.addTransaction,
    delete: queries.deleteTransaction,
  },
  bills: {
    getAll: queries.getBills,
    add: queries.addBill,
    delete: queries.deleteBill,
    getPaidThisMonth: queries.getPaidBillsThisMonth,
  },
  invoices: {
    getAll: queries.getInvoices,
    add: queries.addInvoice,
    updateStatus: queries.updateInvoiceStatus,
  },
  jars: {
    getAll: queries.getJars,
    addFunds: queries.addToJar,
  },
  members: {
    getAll: queries.getMembers,
    add: queries.addMember,
    delete: queries.deleteMember,
  },
  chat: {
    getHistory: queries.getChatHistory,
    saveMessage: queries.saveChatMessage,
  },
  engine: {
    getSTS: async (profile: queries.Profile): Promise<STSResult> => {
      const bills = await queries.getBills();
      const txns = await queries.getTxnsThisMonth();
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(calcSTS(profile, bills, txns));
        }, 300);
      });
    },
    getDangerWindow: async (profile: queries.Profile): Promise<DangerSummary> => {
      const bills = await queries.getBills();
      const catTotals = await queries.getCategoryTotals();
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(buildDangerWindow(profile, bills, catTotals));
        }, 300);
      });
    },
    detectDoom: async (): Promise<DoomResult> => {
      const txns = await queries.getTxnsLast48h();
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(detectDoom(txns));
        }, 300);
      });
    },
  },
};
