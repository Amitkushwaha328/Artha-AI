import { getDB } from './schema';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// ── PROFILE ──────────────────────────────────────────────────────
export async function getProfile() {
  const db = await getDB();
  return db.getFirstAsync<Profile>('SELECT * FROM profile WHERE id = 1');
}

export async function updateProfile(data: Partial<Profile>) {
  const db = await getDB();
  const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(data);
  await db.runAsync(`UPDATE profile SET ${keys} WHERE id = 1`, vals);
}

// ── TRANSACTIONS ─────────────────────────────────────────────────
export async function getTxnsThisMonth() {
  const db = await getDB();
  const from = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const to   = format(endOfMonth(new Date()),   'yyyy-MM-dd');
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE date(txn_date) BETWEEN ? AND ?
     ORDER BY txn_date DESC`,
    [from, to]
  );
}

export async function getTxnsLast48h() {
  const db = await getDB();
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE type = 'debit'
     AND txn_date >= datetime('now', '-48 hours')
     ORDER BY txn_date DESC`
  );
}

export async function getCategoryTotals() {
  const db = await getDB();
  const from = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  return db.getAllAsync<{category: string; total: number; count: number}>(
    `SELECT category, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE type = 'debit' AND date(txn_date) >= ?
     GROUP BY category ORDER BY total DESC`,
    [from]
  );
}

export async function addTransaction(t: Omit<Transaction,'id'|'created_at'>) {
  const db = await getDB();
  return db.runAsync(
    `INSERT INTO transactions (amount,type,category,merchant,note,txn_date,member_id)
     VALUES (?,?,?,?,?,?,?)`,
    [t.amount, t.type, t.category, t.merchant ?? '',
     t.note ?? '', t.txn_date, t.member_id ?? 0]
  );
}

export async function deleteTransaction(id: number) {
  const db = await getDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ── BILLS ────────────────────────────────────────────────────────
export async function getBills() {
  const db = await getDB();
  return db.getAllAsync<Bill>(
    'SELECT * FROM bills WHERE active = 1 ORDER BY due_day'
  );
}

export async function addBill(b: Omit<Bill,'id'>) {
  const db = await getDB();
  return db.runAsync(
    'INSERT INTO bills (name,amount,category,due_day,color) VALUES (?,?,?,?,?)',
    [b.name, b.amount, b.category, b.due_day, b.color ?? '#EF4444']
  );
}

export async function deleteBill(id: number) {
  const db = await getDB();
  await db.runAsync('UPDATE bills SET active = 0 WHERE id = ?', [id]);
}

// Check if a bill (by name match) was paid as a transaction this month
export async function getPaidBillsThisMonth(): Promise<string[]> {
  const db = await getDB();
  const from = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const rows = await db.getAllAsync<{ merchant: string; category: string }>(
    `SELECT LOWER(merchant) as merchant, category FROM transactions
     WHERE type = 'debit'
     AND date(txn_date) >= ?
     AND category IN ('rent', 'emi', 'subscription')`,
    [from]
  );
  return rows.map(r => r.merchant.toLowerCase());
}

// ── INVOICES ─────────────────────────────────────────────────────
export async function getInvoices() {
  const db = await getDB();
  return db.getAllAsync<Invoice>(
    'SELECT * FROM invoices ORDER BY due_date ASC'
  );
}

export async function addInvoice(inv: Omit<Invoice,'id'>) {
  const db = await getDB();
  return db.runAsync(
    'INSERT INTO invoices (client,project,amount,due_date) VALUES (?,?,?,?)',
    [inv.client, inv.project, inv.amount, inv.due_date]
  );
}

export async function updateInvoiceStatus(id: number, status: string) {
  const db = await getDB();
  await db.runAsync('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);
}

// ── MEMBERS ──────────────────────────────────────────────────────
export async function getMembers() {
  const db = await getDB();
  return db.getAllAsync<Member>('SELECT * FROM members ORDER BY id');
}

// ── JARS ─────────────────────────────────────────────────────────
export async function getJars() {
  const db = await getDB();
  return db.getAllAsync<Jar>('SELECT * FROM jars ORDER BY id');
}

export async function addToJar(id: number, amount: number) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE jars SET saved = MIN(target, saved + ?) WHERE id = ?',
    [amount, id]
  );
}

// ── COACH CHAT ───────────────────────────────────────────────────
export async function getChatHistory() {
  const db = await getDB();
  return db.getAllAsync<ChatMessage>(
    'SELECT * FROM coach_chat ORDER BY created_at ASC LIMIT 50'
  );
}

export async function saveChatMessage(role: string, content: string) {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO coach_chat (role, content) VALUES (?, ?)',
    [role, content]
  );
}

// ── TYPES ────────────────────────────────────────────────────────
export interface Profile {
  id: number; name: string; city: string;
  income_type: string; monthly_income: number;
  salary_day: number; current_balance: number;
  safety_pct: number; claude_key: string;
}
export interface Transaction {
  id: number; amount: number; type: string;
  category: string; merchant: string; note: string;
  txn_date: string; is_recurring: number;
  member_id: number; created_at: string;
}
export interface Bill {
  id: number; name: string; amount: number;
  category: string; due_day: number; active: number; color: string;
}
export interface Invoice {
  id: number; client: string; project: string;
  amount: number; status: string; due_date: string; raised_date: string;
}
export interface Member {
  id: number; name: string; initials: string;
  monthly_limit: number; color: string;
}
export interface Jar {
  id: number; name: string; target: number;
  saved: number; color: string; icon: string; auto_save: number;
}
export interface ChatMessage {
  id: number; role: string; content: string; created_at: string;
}