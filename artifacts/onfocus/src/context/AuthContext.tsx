import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "@/lib/firebase";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email";
};

type AuthContextValue = {
  user: AuthUser | null;
  isModalOpen: boolean;
  isLoading: boolean;
  openModal: () => void;
  closeModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function firebaseUserToAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.photoURL || undefined,
    provider: user.providerData[0]?.providerId === "google.com" ? "google" : "email",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUserToAuthUser(firebaseUser) : null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
    setIsModalOpen(false);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setIsModalOpen(false);
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    setIsModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isModalOpen, isLoading, openModal, closeModal, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}