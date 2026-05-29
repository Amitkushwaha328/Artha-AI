import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('artha.db');
  return _db;
}

export async function initDB(): Promise<void> {
  const db = await getDB();

  // Enable WAL mode for better concurrent read performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(`

    -- ── USER PROFILE ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS profile (
      id            INTEGER PRIMARY KEY DEFAULT 1,
      name          TEXT    DEFAULT 'You',
      city          TEXT    DEFAULT 'Hyderabad',
      income_type   TEXT    DEFAULT 'salary',  -- salary | gig | mixed
      monthly_income REAL   DEFAULT 0,
      salary_day    INTEGER DEFAULT 28,         -- day of month
      current_balance REAL  DEFAULT 0,
      safety_pct    REAL    DEFAULT 5,          -- % buffer
      claude_key    TEXT    DEFAULT ''
    );
    INSERT OR IGNORE INTO profile (id) VALUES (1);

    -- ── TRANSACTIONS ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS transactions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      amount       REAL    NOT NULL,
      type         TEXT    NOT NULL,  -- debit | credit
      category     TEXT    NOT NULL DEFAULT 'other',
      merchant     TEXT    DEFAULT '',
      note         TEXT    DEFAULT '',
      txn_date     TEXT    NOT NULL,  -- ISO string
      is_recurring INTEGER DEFAULT 0,
      member_id    INTEGER DEFAULT 0, -- 0 = self
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    -- ── RECURRING BILLS ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS bills (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      amount       REAL    NOT NULL,
      category     TEXT    NOT NULL DEFAULT 'other',
      due_day      INTEGER NOT NULL,  -- 1–31
      active       INTEGER DEFAULT 1,
      color        TEXT    DEFAULT '#EF4444'
    );

    -- ── GIG INVOICES ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS invoices (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      client       TEXT    NOT NULL,
      project      TEXT    NOT NULL,
      amount       REAL    NOT NULL,
      status       TEXT    DEFAULT 'pending', -- pending|collected|overdue
      due_date     TEXT    NOT NULL,
      raised_date  TEXT    DEFAULT (date('now'))
    );

    -- ── FAMILY MEMBERS ────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS members (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      rel           TEXT    DEFAULT 'Family',
      initials      TEXT    NOT NULL,
      monthly_limit REAL    NOT NULL DEFAULT 0,
      color         TEXT    DEFAULT '#3B82F6'
    );


    -- ── SAVINGS JARS ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS jars (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      target       REAL    NOT NULL,
      saved        REAL    DEFAULT 0,
      color        TEXT    DEFAULT '#22C55E',
      icon         TEXT    DEFAULT '🪙',
      auto_save    REAL    DEFAULT 0
    );

    -- ── AI COACH CHAT ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS coach_chat (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      role         TEXT    NOT NULL,  -- user | assistant
      content      TEXT    NOT NULL,
      created_at   TEXT    DEFAULT (datetime('now'))
    );

    -- ── DOOM EVENTS (for history) ──────────────────────────────
    CREATE TABLE IF NOT EXISTS doom_events (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      txn_count    INTEGER NOT NULL,
      total_amount REAL    NOT NULL,
      detected_at  TEXT    DEFAULT (datetime('now')),
      resolved     INTEGER DEFAULT 0
    );

  `);

  try { await db.execAsync("ALTER TABLE members ADD COLUMN rel TEXT DEFAULT 'Family';"); } catch (e) {}
  try { await db.execAsync("ALTER TABLE profile ADD COLUMN language TEXT DEFAULT 'English';"); } catch (e) {}
}