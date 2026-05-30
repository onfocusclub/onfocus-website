import { Link } from "wouter";
import { User, Bookmark, Briefcase, Settings, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-border shadow-sm p-7 ${className}`}>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1.5">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed mb-5">{desc}</p>
      {action}
    </div>
  );
}

const PROFILE_FIELDS = [
  { label: "Full Name", placeholder: "Your full name" },
  { label: "Email Address", placeholder: "you@email.com" },
  { label: "City", placeholder: "Your city" },
  { label: "Phone", placeholder: "+91 00000 00000" },
];

export function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-lg font-semibold text-foreground mb-4">You are not logged in.</p>
        <Button asChild className="rounded-full px-8">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">

        {/* ── Welcome ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage your profile, saved listings, and account settings.
          </p>
        </div>

        {/* ── Quick stats row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Saved", value: "0" },
            { label: "Inquiries", value: "0" },
            { label: "Events Planned", value: "0" },
            { label: "Reviews", value: "0" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-border shadow-sm px-6 py-5">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Profile card */}
            <SectionCard>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {user.provider}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {PROFILE_FIELDS.map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      defaultValue={label === "Full Name" ? user.name : label === "Email Address" ? user.email : ""}
                      className="w-full text-sm text-foreground bg-muted/40 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/60"
                    />
                  </div>
                ))}
              </div>

              <Button className="w-full mt-5 rounded-full h-11 text-sm font-semibold shadow-none" variant="outline">
                Save Changes
              </Button>
            </SectionCard>

            {/* Account settings */}
            <SectionCard>
              <div className="flex items-center gap-2.5 mb-5">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-sm text-foreground">Account Settings</h3>
              </div>
              <div className="space-y-1">
                {[
                  "Email Notifications",
                  "Privacy Settings",
                  "Delete Account",
                ].map((item) => (
                  <button
                    key={item}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-colors hover:bg-muted/60 ${item === "Delete Account" ? "text-red-500" : "text-foreground"}`}
                  >
                    {item}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  Logout
                </button>
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Saved Artists */}
            <SectionCard>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm text-foreground">Saved Artists & Venues</h3>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs rounded-full px-4 h-8 text-muted-foreground">
                  <Link href="/explore">Browse</Link>
                </Button>
              </div>
              <EmptyState
                icon={Star}
                title="Nothing saved yet"
                desc="Browse artists, vendors, and venues and save the ones you love for quick access."
                action={
                  <Button asChild className="rounded-full px-7 h-10 text-sm font-semibold shadow-none">
                    <Link href="/explore">Explore Now</Link>
                  </Button>
                }
              />
            </SectionCard>

            {/* Become a Partner */}
            <SectionCard>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground mb-1">Become a Partner</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Are you an artist, vendor, or venue? Join OnFocus as a partner and get discovered by thousands of people planning events.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Artists", "Vendors", "Venues"].map((type) => (
                      <span key={type} className="px-3.5 py-1.5 bg-muted/60 border border-border rounded-full text-xs font-medium text-foreground">
                        {type}
                      </span>
                    ))}
                  </div>
                  <Button asChild className="rounded-full px-8 h-11 text-sm font-semibold shadow-none">
                    <Link href="/join">Apply Now</Link>
                  </Button>
                </div>
              </div>
            </SectionCard>

            {/* Inquiry history */}
            <SectionCard>
              <div className="flex items-center gap-2.5 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-sm text-foreground">Inquiry History</h3>
              </div>
              <EmptyState
                icon={User}
                title="No inquiries yet"
                desc="When you reach out to an artist, vendor, or venue, your inquiries will appear here."
              />
            </SectionCard>

          </div>
        </div>
      </div>
    </div>
  );
}
