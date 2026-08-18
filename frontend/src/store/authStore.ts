import { create } from 'zustand';

export interface UserProfile {
  email: string;
  mobile: string;
  countryCode: string;
  role: string;
  verifiedAt: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
}

const getInitialUser = (): UserProfile | null => {
  try {
    const saved = localStorage.getItem('freshvision_auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  isLoggedIn: !!getInitialUser(),
  login: (user) => {
    try {
      localStorage.setItem('freshvision_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth state', e);
    }
    set({ user, isLoggedIn: true });
  },
  logout: () => {
    try {
      localStorage.removeItem('freshvision_auth_user');
      localStorage.removeItem('freshvision_token');
    } catch (e) {
      console.error('Failed to clear auth state', e);
    }
    set({ user: null, isLoggedIn: false });
  },
}));
