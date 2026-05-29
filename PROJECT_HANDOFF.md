
# Artha AI: Project Handoff Document

This document summarizes the current state, architecture, and history of the **Artha AI** mobile application. It is designed to provide context to another AI or developer taking over the project.

## 1. Project Overview
**Artha AI** is India's first trauma-informed AI financial survival platform designed specifically for freelancers. Instead of traditional budgeting, it focuses on financial anxiety reduction, forecasting "Danger Windows", and providing actionable "Jugaad" (workaround) solutions.

## 2. Tech Stack
* **Framework**: React Native with Expo (SDK 56)
* **Language**: TypeScript
* **State Management**: Zustand
* **Database**: Local SQLite (`expo-sqlite` v14+ async API)
* **Navigation**: `@react-navigation/bottom-tabs` and `@react-navigation/stack`
* **Animations**: `react-native-reanimated`
* **Charts/Data Vis**: `victory-native`
* **AI Integration**: Anthropic Claude API (`ai/claude.ts`) mimicking IBM Granite / Watsonx for branding.

## 3. Core Features & Engines
The app runs completely locally using device storage for privacy. The core logic is split into 5 financial engines located in the `engine/` folder:
1. **Safe to Spend (`safeToSpend.ts`)**: Calculates daily spendable amount after subtracting upcoming recurring bills and setting a 5% safety buffer.
2. **Danger Window (`dangerWindow.ts`)**: Forecasts the next 30 days to predict exactly which day the user's balance will drop below zero due to upcoming bills vs current balance.
3. **Doom Detector (`doomDetector.ts`)**: Scans recent micro-transactions (e.g., 7 purchases under ₹500 in 48 hours) to detect "doom spending" triggered by financial anxiety.
4. **Jugaad Tips**: Calculates a "Jugaad Score" and provides contextual money-saving hacks.
5. **Scheme Radar (`schemeEngine.ts`)**: Matches the user's profile with Indian government schemes (e.g., PMJDY, APY, DPIIT).

## 4. UI/UX & Navigation
* **Theme**: "Classic Midnight" strict dark mode (`#121212` background, `#1A1A1A` surfaces, `#F8FAFC` text). 
* **Structure**: A Bottom Tab Navigator (Home, Forecast, Gig, Family, Settings) wrapped inside a Stack Navigator to allow full-screen and modal overlays.
* **Modals/Stacks**: 
  * `Alerts` (Financial notifications)
  * `Doom` (Doom spending intervention)
  * `Jugaad` (Money saving tips)
  * `Breathe` (4-4-6 Box breathing exercise for anxiety reduction)
  * `Schemes` (Government scheme matching)
  * `Coach` (AI Financial Chatbot)

## 5. Recent Changes & Debugging History
1. **Database Race Condition Fixed**: Modified `App.tsx` to include an `isDbReady` loading gate. The UI now waits for `initDB()` to finish creating tables before rendering screens that query the DB.
2. **SQLite Singleton**: Updated `db/schema.ts` to use a shared connection instance from `db/queries.ts` to prevent file locking/deadlocks.
3. **Expo SDK 56 Alignments**: Installed missing `@expo/vector-icons`, created `babel.config.js` to register the `react-native-reanimated/plugin`, and updated `expo-notifications` triggers to comply with modern SDK requirements.
4. **Clean Slate / Real Data Mode**: Removed the `seedDB()` execution from `App.tsx` so the app no longer injects dummy prototype data (Ravi Sharma profile). The app is now ready to receive real user transaction data.

## 6. Project Structure
```text
artha/
├── App.tsx                 # Entry point, navigation, DB initialization
├── babel.config.js         # Babel config (Reanimated plugin)
├── package.json            # Expo SDK 56 dependencies
├── ai/
│   ├── claude.ts           # Anthropic API network requests & mock fallbacks
│   └── coach.ts            # AI Coach prompt construction
├── app/                    # Screen components (index, forecast, gig, doom, coach, etc.)
├── components/             # Reusable UI (SafeToSpendCard, BreathCircle, etc.)
├── db/
│   ├── schema.ts           # SQLite table definitions (initDB)
│   ├── queries.ts          # SQLite CRUD operations
│   └── seed.ts             # Dummy data injection (currently disconnected)
├── engine/                 # Financial calculation logic
├── store/
│   └── useStore.ts         # Zustand global state (user profile, scores)
├── theme/                  # Colors, spacing, typography constants
└── utils/                  # Helpers (notifications, dates, currency)
```
