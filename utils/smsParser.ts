// utils/smsParser.ts — UPI SMS parser for auto-importing bank transactions

export interface ParsedSMS {
  amount:   number;
  type:     'debit' | 'credit';
  merchant: string;
  bank:     string;
}

export function parseUpiSMS(smsBody: string): ParsedSMS | null {
  const body = smsBody.toLowerCase();

  const isDebit  = /debited|paid|sent|withdrawn/.test(body);
  const isCredit = /credited|received|added/.test(body);
  if (!isDebit && !isCredit) return null;

  // Extract amount — handles Rs., INR, ₹
  const amtMatch = body.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!amtMatch) return null;
  const amount = parseFloat(amtMatch[1].replace(/,/g, ''));

  // Extract merchant (text after 'to', 'at', 'at vpa')
  const merchantMatch = body.match(/(?:to|at|at vpa|trf to)\s+([a-z0-9@._\s-]{3,30})/i);
  const merchant = merchantMatch
    ? merchantMatch[1].trim().replace(/\s+/g, ' ')
    : 'Unknown';

  // Detect bank
  const bank = body.includes('hdfc')  ? 'HDFC'  :
               body.includes('sbi')   ? 'SBI'   :
               body.includes('icici') ? 'ICICI' :
               body.includes('axis')  ? 'Axis'  :
               'Unknown';

  return { amount, type: isDebit ? 'debit' : 'credit', merchant, bank };
}

// Auto-categorise from merchant name
export function guessCategory(merchant: string): string {
  const m = merchant.toLowerCase();
  if (/zomato|swiggy|dunzo|magicpin/.test(m))            return 'food';
  if (/bigbasket|blinkit|dmart|reliance|zepto/.test(m))  return 'groceries';
  if (/ola|uber|rapido|metro|irctc/.test(m))             return 'transport';
  if (/netflix|spotify|hotstar|prime|jio/.test(m))       return 'subscription';
  if (/apollo|practo|medplus|pharmacy/.test(m))          return 'medical';
  if (/bajaj|emi|loan|lic/.test(m))                      return 'emi';
  return 'other';
}

// Paste-to-import: user pastes SMS text, we parse and return
export function importPastedSMS(text: string) {
  const parsed = parseUpiSMS(text);
  if (!parsed) return null;
  return {
    ...parsed,
    category: guessCategory(parsed.merchant),
    txn_date: new Date().toISOString(),
  };
}
