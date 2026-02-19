import { create } from 'zustand';
import { AuthService } from '@services/auth';
import { AuthTokens, UserProfile } from '@types/auth';

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  tokens: AuthTokens | null;

  login: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  getValidToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,

  login: async () => {
    set({ isLoading: true });
    try {
      const tokens = await AuthService.login();
      const user = AuthService.extractUserProfile(tokens.accessToken);
      set({ isAuthenticated: true, user, tokens, isLoading: false });
    } catch (error) {
      console.error('Login failed:', error);
      set({ isAuthenticated: false, user: null, tokens: null, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const { tokens } = get();
    set({ isLoading: true });
    await AuthService.logout(tokens?.idToken);
    set({ isAuthenticated: false, user: null, tokens: null, isLoading: false });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const tokens = await AuthService.tryRestoreSession();
      if (tokens) {
        const user = AuthService.extractUserProfile(tokens.accessToken);
        set({ isAuthenticated: true, user, tokens, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, tokens: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, tokens: null, isLoading: false });
    }
  },

  getValidToken: async (): Promise<string | null> => {
    const { tokens } = get();
    if (!tokens) return null;

    if (AuthService.isTokenExpired(tokens)) {
      try {
        const refreshed = await AuthService.refreshTokens(tokens.refreshToken);
        const user = AuthService.extractUserProfile(refreshed.accessToken);
        set({ tokens: refreshed, user });
        return refreshed.accessToken;
      } catch {
        set({ isAuthenticated: false, user: null, tokens: null });
        return null;
      }
    }

    return tokens.accessToken;
  },
}));
