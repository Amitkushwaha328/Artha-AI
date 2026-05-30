import { create } from 'zustand';
import { Alert } from 'react-native';
import { api, Profile, STSResult, DangerSummary, DoomResult } from '../services/api';

interface AppState {
  // Profile
  profile:      Profile | null;
  setProfile:   (p: Profile) => void;
  refreshProfile: () => Promise<void>;

  // Computed financial state
  sts:          STSResult | null;
  danger:       DangerSummary | null;
  doom:         DoomResult | null;
  isLoading:    boolean;

  // Convenience selectors
  safeToSpend:  number | null;
  balance:      number | null;
  monthlyIncome:number;
  dangerWindow: DangerSummary | null;
  doomActive:   boolean;
  
  // App alerts & scores
  alerts:       number;
  setAlerts:    (val: number) => void;
  jugaadScore:  number;
  updateJugaadScore: (val: number) => void;

  // Actions
  refreshAll:   () => Promise<void>;
  updateBalance:(amount: number, type: 'add'|'subtract') => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  profile:   null,
  sts:       null,
  danger:    null,
  doom:      null,
  isLoading: true,

  safeToSpend: null,
  balance: null,
  monthlyIncome: 72000,
  dangerWindow: null,
  doomActive: false,
  
  alerts: 3,
  setAlerts: (val) => set({ alerts: val }),
  jugaadScore: 74,
  updateJugaadScore: (val) => set({ jugaadScore: val }),

  setProfile: (p) => set({ profile: p }),

  refreshProfile: async () => {
    const p = await api.profile.get();
    if (p) set({ profile: p });
  },

  refreshAll: async () => {
    set({ isLoading: true });
    try {
      const profile = await api.profile.get();
      if (!profile) { set({ isLoading: false }); return; }

      // Run all 3 engines in parallel via API
      const [sts, danger, doom] = await Promise.all([
        api.engine.getSTS(profile),
        api.engine.getDangerWindow(profile),
        api.engine.detectDoom(),
      ]);

      set({ 
        profile, 
        sts, 
        danger, 
        doom, 
        isLoading: false,
        safeToSpend: sts.safeAmount,
        balance: profile.current_balance,
        monthlyIncome: profile.monthly_income,
        dangerWindow: danger,
        doomActive: doom.isDoom,
      });
    } catch (e) {
      console.error('Store refresh error:', e);
      set({ isLoading: false });
      Alert.alert(
        'Sync Error',
        'Could not update latest financial dashboard. Please check your internet connection.'
      );
    }
  },

  // Called after adding any transaction to keep balance in sync
  updateBalance: async (amount, type) => {
    const { profile } = get();
    if (!profile) return;
    const newBalance = type === 'add'
      ? profile.current_balance + amount
      : profile.current_balance - amount;
    await api.profile.update({ current_balance: Math.max(0, newBalance) });
    await get().refreshAll();
  },
}));