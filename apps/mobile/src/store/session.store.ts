import { create } from 'zustand';

export interface UserSession {
  id: string;
  shopId: string;
  email: string;
  role: 'OWNER' | 'EMPLOYEE';
}

export interface ShopInfo {
  id: string;
  name: string;
}

export type SyncChipState = 'ALL_SAVED' | 'WAITING' | 'SYNCING' | 'NEEDS_ATTENTION' | 'OFFLINE';

export interface SessionState {
  // Connection and Configuration
  serverUrl: string;
  isOnline: boolean;

  // Authentication Data
  accessToken: string | null;
  refreshToken: string | null;
  user: UserSession | null;
  shop: ShopInfo | null;
  isAuthenticated: boolean;

  // Sync Diagnostics & Status Chip (§FE-15)
  syncStatus: SyncChipState;
  pendingOpsCount: number;
  lastSyncedAt: number | null;

  // Actions
  setServerUrl: (url: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSession: (params: {
    accessToken: string;
    refreshToken: string;
    user: UserSession;
    shop: ShopInfo;
  }) => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  setSyncStatus: (status: SyncChipState, pendingOpsCount?: number) => void;
  clearSession: () => void;
}

const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const useSessionStore = create<SessionState>((set) => ({
  serverUrl: DEFAULT_SERVER_URL,
  isOnline: true,

  accessToken: null,
  refreshToken: null,
  user: null,
  shop: null,
  isAuthenticated: false,

  syncStatus: 'ALL_SAVED',
  pendingOpsCount: 0,
  lastSyncedAt: null,

  setServerUrl: (url: string) => set({ serverUrl: url }),

  setOnlineStatus: (isOnline: boolean) =>
    set((state) => ({
      isOnline,
      syncStatus: isOnline ? (state.pendingOpsCount > 0 ? 'WAITING' : 'ALL_SAVED') : 'OFFLINE',
    })),

  setSession: ({ accessToken, refreshToken, user, shop }) =>
    set({
      accessToken,
      refreshToken,
      user,
      shop,
      isAuthenticated: true,
    }),

  updateTokens: (accessToken: string, refreshToken?: string) =>
    set((state) => ({
      accessToken,
      refreshToken: refreshToken ?? state.refreshToken,
    })),

  setSyncStatus: (status: SyncChipState, pendingOpsCount?: number) =>
    set((state) => ({
      syncStatus: status,
      pendingOpsCount: pendingOpsCount !== undefined ? pendingOpsCount : state.pendingOpsCount,
      lastSyncedAt: status === 'ALL_SAVED' ? Date.now() : state.lastSyncedAt,
    })),

  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      shop: null,
      isAuthenticated: false,
      syncStatus: 'ALL_SAVED',
      pendingOpsCount: 0,
    }),
}));
