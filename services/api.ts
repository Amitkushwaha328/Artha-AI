import * as queries from '../db/queries';
export * from '../db/queries'; // Re-export types like Profile, Transaction, etc.

/**
 * API Abstraction Layer
 * 
 * Currently this wraps the local SQLite database queries.
 * Once the backend is ready, these functions will be replaced
 * with fetch/axios calls to the remote REST API, keeping the
 * UI components unaware of the underlying data source.
 */

export const api = {
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
};
