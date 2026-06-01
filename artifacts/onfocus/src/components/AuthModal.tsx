import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "options" | "login" | "register";

export function AuthModal() {
  const { isModalOpen, closeModal, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("options");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setMode("options");
      setName(""); setEmail(""); setPassword("");
      setError(""); setLoading(false);
    }
  }, [isModalOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeModal]);

  async function handleGoogle() {
    setError(""); setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(e.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit() {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (e: any) {
      const msg = e.code === "auth/wrong-password" ? "Wrong password" :
                  e.code === "auth/user-not-found" ? "No account found with this email" :
                  e.code === "auth/email-already-in-use" ? "Email already registered" :
                  e.code === "auth/weak-password" ? "Password must be at least 6 characters" :
                  e.message || "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={closeModal} aria-hidden
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-border/40 overflow-hidden"
              role="dialog" aria-modal aria-label="Sign in to OnFocus"
            >
              <div className="flex justify-end px-5 pt-5">
                <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-8 pb-10 pt-2">
                <div className="mb-6 text-center">
                  <p className="text-2xl font-bold tracking-tight text-foreground">OnFocus</p>
                </div>

                {/* Options Screen */}
                {mode === "options" && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-[22px] font-bold text-foreground mb-2 tracking-tight">Welcome to OnFocus</h2>
                      <p className="text-sm text-muted-foreground">Discover artists, vendors, and venues for meaningful experiences.</p>
                    </div>
                    <div className="space-y-3">
                      <button onClick={handleGoogle} disabled={loading}
                        className="w-full flex items-center justify-center gap-3.5 px-5 h-[52px] rounded-xl border border-border bg-white hover:bg-muted/60 transition-all text-sm font-medium text-foreground shadow-sm disabled:opacity-50">
                        <SiGoogle className="w-5 h-5 text-[#4285F4]" />
                        Continue with Google
                      </button>
                      <button onClick={() => setMode("login")}
                        className="w-full flex items-center justify-center gap-3.5 px-5 h-[52px] rounded-xl border border-border bg-white hover:bg-muted/60 transition-all text-sm font-medium text-foreground shadow-sm">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        Continue with Email
                      </button>
                    </div>
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                      By continuing, you agree to OnFocus's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                  </>
                )}

                {/* Login / Register Screen */}
                {(mode === "login" || mode === "register") && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-[22px] font-bold text-foreground mb-1 tracking-tight">
                        {mode === "login" ? "Sign in" : "Create account"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {mode === "login" ? "Welcome back!" : "Join OnFocus today"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {mode === "register" && (
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="pl-10" />
                        </div>
                      )}
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                      <Button onClick={handleEmailSubmit} disabled={loading} className="w-full h-[52px] rounded-xl font-semibold">
                        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                      </Button>
                    </div>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      {mode === "login" ? (
                        <>Don't have an account? <button onClick={() => { setMode("register"); setError(""); }} className="text-foreground font-semibold hover:underline">Sign up</button></>
                      ) : (
                        <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }} className="text-foreground font-semibold hover:underline">Sign in</button></>
                      )}
                    </div>

                    <button onClick={() => setMode("options")} className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                      ← Back
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}