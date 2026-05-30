import { Profile, Bill } from '../db/queries';
import { addDays, format, getDate } from 'date-fns';

export interface DayForecast {
  day:        number;
  date:       string;
  balance:    number;
  events:     string[];
  riskLevel:  'safe' | 'warning' | 'danger';
}

export interface DangerSummary {
  hasDanger:   boolean;
  firstDay:    number | null;
  firstDate:   string | null;
  shortfall:   number;
  forecasts:   DayForecast[];
}

export function buildDangerWindow(
  profile: Profile,
  bills: Bill[],
  catTotals: { category: string; total: number }[]
): DangerSummary {
  // Daily variable burn = this month's variable spend / days so far
  const variableSpend = catTotals
    .filter(c => !['rent','emi','subscription'].includes(c.category))
    .reduce((s, c) => s + c.total, 0);
  const dayOfMonth = new Date().getDate();
  const dailyBurn  = variableSpend / Math.max(1, dayOfMonth);

  let runningBalance = profile.current_balance;
  const forecasts: DayForecast[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const futureDate = addDays(today, i);
    const dom        = getDate(futureDate);
    const events: string[] = [];

    // Deduct bills due on this day
    bills.forEach(b => {
      if (b.due_day === dom) {
        runningBalance -= b.amount;
        events.push(`${b.name}: -₹${b.amount.toLocaleString('en-IN')}`);
      }
    });

    // Add salary/income on salary day
    if (dom === profile.salary_day) {
      runningBalance += profile.monthly_income;
      events.push(`Income: +₹${profile.monthly_income.toLocaleString('en-IN')}`);
    }

    // Daily variable burn
    runningBalance -= dailyBurn;

    const riskLevel: DayForecast['riskLevel'] =
      runningBalance < 0     ? 'danger'  :
      runningBalance < 5000  ? 'warning' : 'safe';

    forecasts.push({
      day: i,
      date: format(futureDate, 'MMM d'),
      balance: Math.round(runningBalance),
      events,
      riskLevel,
    });
  }

  const firstDanger = forecasts.find(f => f.riskLevel === 'danger');

  return {
    hasDanger:  !!firstDanger,
    firstDay:   firstDanger?.day ?? null,
    firstDate:  firstDanger?.date ?? null,
    shortfall:  firstDanger ? Math.abs(Math.min(0, firstDanger.balance)) : 0,
    forecasts,
  };
}