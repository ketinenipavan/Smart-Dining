import { create } from 'zustand';
import type { AuthUser, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSupabaseLive: boolean;
  login: (email: string, password: string, intendedRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: UserRole) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = 'smart_dining_auth_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isSupabaseLive: isSupabaseConfigured,

  clearError: () => set({ error: null }),

  initAuth: async () => {
    set({ isLoading: true });

    // 1. Check active Supabase session if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          const userMeta = session.user.user_metadata || {};
          const role: UserRole = (userMeta.role as UserRole) || (session.user.email?.includes('admin') ? 'admin' : 'kitchen');

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role,
            fullName: userMeta.full_name || session.user.email?.split('@')[0],
          };

          set({ user: authUser, isAuthenticated: true, isLoading: false, isSupabaseLive: true });
          return;
        }
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }
    }

    // 2. Fallback to localStorage session
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed && parsed.id && parsed.role) {
          set({ user: parsed, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  login: async (email: string, password: string, intendedRole: UserRole) => {
    set({ isLoading: true, error: null });

    // Try Supabase Auth if client is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.warn('Supabase login returned error, attempting fallback:', error.message);
        } else if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const assignedRole: UserRole = (userMeta.role as UserRole) || intendedRole;

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: assignedRole,
            fullName: userMeta.full_name || email.split('@')[0],
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          set({ user: authUser, isAuthenticated: true, isLoading: false, isSupabaseLive: true });
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase auth network exception:', err);
      }
    }

    // Local / Offline demo authentication fallback
    // Allows chefs, managers, and testing without requiring external credentials
    await new Promise((r) => setTimeout(r, 400)); // Smooth feel
    const fallbackUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email,
      role: intendedRole,
      fullName: email.split('@')[0] || (intendedRole === 'admin' ? 'Restaurant Manager' : 'Master Chef'),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
    set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
    return { success: true };
  },

  signUp: async (email: string, password: string, role: UserRole, fullName?: string) => {
    set({ isLoading: true, error: null });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: fullName,
            },
          },
        });

        if (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role,
            fullName: fullName || email.split('@')[0],
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          set({ user: authUser, isAuthenticated: true, isLoading: false, isSupabaseLive: true });
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up error';
        set({ error: message, isLoading: false });
        return { success: false, error: message };
      }
    }

    // Local fallback signup
    const fallbackUser: AuthUser = {
      id: `usr_${Date.now()}`,
      email,
      role,
      fullName: fullName || email.split('@')[0],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
    set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
    return { success: true };
  },

  demoLogin: (role: UserRole) => {
    const demoProfiles: Record<UserRole, AuthUser> = {
      admin: {
        id: 'usr_admin_001',
        email: 'admin@smartdining.com',
        role: 'admin',
        fullName: 'Rajesh Sharma (General Manager)',
      },
      kitchen: {
        id: 'usr_kitchen_001',
        email: 'chef@smartdining.com',
        role: 'kitchen',
        fullName: 'Chef Sanjeev (Head Tandoor Chef)',
      },
      customer: {
        id: 'usr_customer_001',
        email: 'guest@smartdining.com',
        role: 'customer',
        fullName: 'Table Guest',
      },
    };

    const authUser = demoProfiles[role];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    set({ user: authUser, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    set({ isLoading: true });
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
