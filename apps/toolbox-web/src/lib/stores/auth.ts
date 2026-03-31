import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

export const authSessionKey = 'YXV0aF9zZXNzaW9u';

export type AuthStoreState = {
  token?: string;
};

export const INITIAL_AUTH_STORE_VALUE: AuthStoreState = {
  token: undefined,
};

type AuthStoreActions = {
  setToken: (token: string) => void;
  clearAuth: () => void;
};

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_AUTH_STORE_VALUE,
      setToken: (token) => set({ token }),
      clearAuth: () => set(INITIAL_AUTH_STORE_VALUE),
    }),
    {
      name: authSessionKey,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useAuthState = (): AuthStoreState =>
  useAuth(useShallow(({ token }) => ({ token })));

export const useAuthAction = (): AuthStoreActions =>
  useAuth(useShallow(({ setToken, clearAuth }) => ({ setToken, clearAuth })));
