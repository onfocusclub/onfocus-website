import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { useAuth, type AuthUser } from "@/context/AuthContext";

function SocialButton({
  onClick,
  icon,
  label,
  testId,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="w-full flex items-center justify-center gap-3.5 px-5 h-[52px] rounded-xl border border-border bg-white hover:bg-muted/60 active:scale-[0.99] transition-all duration-150 text-sm font-medium text-foreground shadow-sm"
    >
      {icon}
      {label}
    </button>
  );
}

export function AuthModal() {
  const { isModalOpen, closeModal, login } = useAuth();

  // Lock body scroll while open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeModal]);

  // Demo login — replace with real OAuth redirect in production
  function handleGoogle() {
    const mockUser: AuthUser = {
      id: "google-demo",
      name: "Alex Rivera",
      email: "alex@gmail.com",
      provider: "google",
    };
    login(mockUser);
  }

  function handleFacebook() {
    const mockUser: AuthUser = {
      id: "fb-demo",
      name: "Alex Rivera",
      email: "alex@facebook.com",
      provider: "facebook",
    };
    login(mockUser);
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={closeModal}
            aria-hidden
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-border/40 overflow-hidden"
              role="dialog"
              aria-modal
              aria-label="Sign in to OnFocus"
            >
              {/* Close button */}
              <div className="flex justify-end px-5 pt-5">
                <button
                  onClick={closeModal}
                  data-testid="button-auth-close"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-10 pt-2">
                {/* Logo mark */}
                <div className="mb-7 text-center">
                  <p className="text-2xl font-bold tracking-tight text-foreground">OnFocus</p>
                </div>

                {/* Headline */}
                <div className="text-center mb-8">
                  <h2 className="text-[22px] font-bold text-foreground mb-2 tracking-tight">
                    Welcome to OnFocus
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
                    Discover artists, vendors, and venues for meaningful experiences.
                  </p>
                </div>

                {/* Social buttons */}
                <div className="space-y-3">
                  <SocialButton
                    onClick={handleGoogle}
                    testId="button-auth-google"
                    label="Continue with Google"
                    icon={
                      <span className="w-5 h-5 shrink-0">
                        <SiGoogle className="w-full h-full text-[#4285F4]" />
                      </span>
                    }
                  />
                  <SocialButton
                    onClick={handleFacebook}
                    testId="button-auth-facebook"
                    label="Continue with Facebook"
                    icon={
                      <span className="w-5 h-5 shrink-0">
                        <SiFacebook className="w-full h-full text-[#1877F2]" />
                      </span>
                    }
                  />
                </div>

                {/* Footer note */}
                <p className="mt-7 text-center text-xs text-muted-foreground leading-relaxed">
                  By continuing, you agree to OnFocus's{" "}
                  <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
