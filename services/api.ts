import * as SecureStore from 'expo-secure-store';
import { STSResult } from '../engine/safeToSpend';
import { DangerSummary } from '../engine/dangerWindow';
import { detectDoom, DoomResult } from '../engine/doomDetector';
import * as queries from '../db/queries';

export * from '../db/queries'; // Re-export types like Profile, Transaction, etc.
export { STSResult, DangerSummary, DoomResult };

const BASE_URL = 'http://10.215.168.109:3000';
const TOKEN_KEY = 'artha_auth_token';

/**
 * Fetch Wrapper Helper
 */
async function getHeaders() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

/**
 * API Client Implementation connecting to REST API backend
 */
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    register: async (email: string, password: string, name: string) => {
      return request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    },
    verifyToken: async (token: string) => {
      return request<{ valid: boolean; user: any }>('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },
  profile: {
    get: async (): Promise<queries.Profile> => {
      return request<queries.Profile>('/profile');
    },
    update: async (data: Partial<queries.Profile>): Promise<queries.Profile> => {
      return request<queries.Profile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  transactions: {
    getThisMonth: async (): Promise<queries.Transaction[]> => {
      return request<queries.Transaction[]>('/transactions');
    },
    getLast48h: async (): Promise<queries.Transaction[]> => {
      return request<queries.Transaction[]>('/transactions/last48h');
    },
    getCategoryTotals: async (): Promise<{ category: string; total: number; count: number }[]> => {
      return request<{ category: string; total: number; count: number }[]>('/transactions/category-totals');
    },
    add: async (t: Omit<queries.Transaction, 'id' | 'created_at'>) => {
      return request<queries.Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(t),
      });
    },
    delete: async (id: number) => {
      return request<{ success: boolean }>(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },
  bills: {
    getAll: async (): Promise<queries.Bill[]> => {
      return request<queries.Bill[]>('/bills');
    },
    add: async (b: Omit<queries.Bill, 'id'>) => {
      return request<queries.Bill>('/bills', {
        method: 'POST',
        body: JSON.stringify(b),
      });
    },
    delete: async (id: number) => {
      return request<{ success: boolean }>(`/bills/${id}`, {
        method: 'DELETE',
      });
    },
    getPaidThisMonth: async (): Promise<string[]> => {
      return request<string[]>('/bills/paid-this-month');
    },
  },
  invoices: {
    getAll: async (): Promise<queries.Invoice[]> => {
      return request<queries.Invoice[]>('/invoices');
    },
    add: async (inv: Omit<queries.Invoice, 'id'>) => {
      return request<queries.Invoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify(inv),
      });
    },
    updateStatus: async (id: number, status: string) => {
      return request<queries.Invoice>(`/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },
  jars: {
    getAll: async (): Promise<queries.Jar[]> => {
      return request<queries.Jar[]>('/jars');
    },
    addFunds: async (id: number, amount: number) => {
      return request<queries.Jar>(`/jars/${id}/fund`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
  },
  members: {
    getAll: async (): Promise<queries.Member[]> => {
      return request<queries.Member[]>('/members');
    },
    add: async (m: { name: string; rel: string; initials: string; monthly_limit: number; color: string }) => {
      return request<queries.Member>('/members', {
        method: 'POST',
        body: JSON.stringify(m),
      });
    },
    delete: async (id: number) => {
      return request<{ success: boolean }>(`/members/${id}`, {
        method: 'DELETE',
      });
    },
  },
  chat: {
    getHistory: async (): Promise<queries.ChatMessage[]> => {
      return request<queries.ChatMessage[]>('/chat');
    },
    saveMessage: async (role: string, content: string) => {
      return request<queries.ChatMessage>('/chat', {
        method: 'POST',
        body: JSON.stringify({ role, content }),
      });
    },
  },
  engine: {
    getSTS: async (profile: queries.Profile): Promise<STSResult> => {
      return request<STSResult>('/engine/sts');
    },
    getDangerWindow: async (profile: queries.Profile): Promise<DangerSummary> => {
      return request<DangerSummary>('/engine/danger-window');
    },
    detectDoom: async (): Promise<DoomResult> => {
      return request<DoomResult>('/engine/doom');
    },
  },
};
