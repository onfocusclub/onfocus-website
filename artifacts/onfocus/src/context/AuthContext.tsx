import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook";
};

type AuthContextValue = {
  user: AuthUser | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const login = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    setIsModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isModalOpen, openModal, closeModal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
