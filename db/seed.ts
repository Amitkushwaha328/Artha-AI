import * as SQLite from 'expo-sqlite';
import { getDB } from './schema';

export async function seedDB() {
  const db = await getDB();

  // Check if already seeded to avoid duplicates
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM bills');
  if (existing && existing.count > 0) {
    return;
  }

  console.log('Seeding database with Ravi Sharma profile...');

  // Update profile
  await db.runAsync(`
    UPDATE profile SET 
      name = 'Ravi Sharma', 
      city = 'Hyderabad', 
      income_type = 'mixed', 
      monthly_income = 72000, 
      salary_day = 28,
      current_balance = 35430, 
      safety_pct = 5 
    WHERE id = 1
  `);

  // Seed Bills
  await db.execAsync(`
    INSERT INTO bills (name, amount, category, due_day, color) VALUES ('Rent', 18000, 'rent', 5, '#EF4444');
    INSERT INTO bills (name, amount, category, due_day, color) VALUES ('EMI', 4800, 'emi', 3, '#FFB347');
    INSERT INTO bills (name, amount, category, due_day, color) VALUES ('Subscriptions', 1498, 'subscription', 10, '#3B82F6');
  `);

  // Seed Jars
  await db.execAsync(`
    INSERT INTO jars (name, target, saved, color, icon, auto_save) VALUES ('Advance Tax', 30000, 18500, '#22C55E', '🪙', 10);
    INSERT INTO jars (name, target, saved, color, icon, auto_save) VALUES ('Diwali Goal', 25000, 5000, '#FF6B35', '🎁', 5);
  `);

  // Seed Invoices
  await db.execAsync(`
    INSERT INTO invoices (client, project, amount, status, due_date) VALUES ('Zepto', 'UI Design', 45000, 'overdue', date('now', '-5 days'));
    INSERT INTO invoices (client, project, amount, status, due_date) VALUES ('Swiggy', 'Banner Design', 15000, 'pending', date('now', '+15 days'));
    INSERT INTO invoices (client, project, amount, status, due_date) VALUES ('Blinkit', 'Icon Set', 12000, 'collected', date('now', '-20 days'));
  `);

  // Seed Members
  await db.execAsync(`
    INSERT INTO members (name, initials, monthly_limit, color) VALUES ('Ravi (You)', 'RS', 45000, '#38BDF8');
    INSERT INTO members (name, initials, monthly_limit, color) VALUES ('Priya', 'PS', 12000, '#F87171');
    INSERT INTO members (name, initials, monthly_limit, color) VALUES ('Amma', 'AS', 8000, '#22C55E');
  `);

  // Seed Transactions (including recent micro-spends to trigger doom spending)
  await db.execAsync(`
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (120, 'debit', 'food', 'Zomato', datetime('now', '-2 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (240, 'debit', 'food', 'Swiggy', datetime('now', '-6 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (49, 'debit', 'entertainment', 'Steam', datetime('now', '-12 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (85, 'debit', 'groceries', 'Blinkit', datetime('now', '-24 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (150, 'debit', 'transport', 'Uber', datetime('now', '-30 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (99, 'debit', 'entertainment', 'Hotstar', datetime('now', '-40 hours'));
    INSERT INTO transactions (amount, type, category, merchant, txn_date) VALUES (180, 'debit', 'food', 'Zomato', datetime('now', '-42 hours'));
  `);
  
  console.log('Database seeded successfully.');
}
