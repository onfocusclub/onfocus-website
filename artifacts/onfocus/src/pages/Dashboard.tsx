import { Link } from "wouter";
import { User, Bookmark, Briefcase, Settings, ChevronRight, Star, MapPin, LogOut, Edit, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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

type Listing = {
  id: number;
  name: string;
  type: string;
  category: string;
  city: string;
  bio: string;
  coverImage: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  priceRange: string | null;
  yearsActive: number | null;
  eventsCompleted: number | null;
  verified: boolean;
};

type Application = {
  id: number;
  status: "pending" | "approved" | "rejected";
  name: string;
  type: string;
  submitted_at: string;
  admin_notes: string | null;
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const [partnerListing, setPartnerListing] = useState<Listing | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(true);
  const ADMIN_EMAILS = ["onfocusclub@gmail.com"];
const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");

  useEffect(() => {
    if (!user) return;


    const ADMIN_EMAILS = ["onfocusclub@gmail.com"];
const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");

    async function fetchPartnerData() {
      setLoadingPartner(true);
      try {
        // Check for approved listing by email
        const listingRes = await fetch(`${API_BASE}/api/listings?email=${encodeURIComponent(user!.email)}`);
        if (listingRes.ok) {
          const data = await listingRes.json();
          if (data.listings?.length > 0) {
            setPartnerListing(data.listings[0]);
          }
        }

        // Check for pending/rejected application
        const appRes = await fetch(`${API_BASE}/api/partner-applications?email=${encodeURIComponent(user!.email)}`);
        if (appRes.ok) {
          const data = await appRes.json();
          if (data.data?.length > 0) {
            setApplication(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch partner data:", err);
      } finally {
        setLoadingPartner(false);
      }
    }

    fetchPartnerData();
  }, [user]);

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

        {/* Welcome */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {partnerListing ? "Manage your partner profile and listings." : "Manage your profile, saved listings, and account settings."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Profile card */}
            <SectionCard>
              <div className="flex items-center gap-4 mb-6">
                {partnerListing?.profileImage ? (
                  <img src={partnerListing.profileImage} alt={user.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-lg font-bold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                      {user.provider}
                    </span>
                    {partnerListing && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Partner ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Account settings */}
            <SectionCard>
              <div className="flex items-center gap-2.5 mb-5">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-sm text-foreground">Account Settings</h3>
              </div>
              <div className="space-y-1">
                {["Email Notifications", "Privacy Settings", "Delete Account"].map((item) => (
                  <button key={item} className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-colors hover:bg-muted/60 ${item === "Delete Account" ? "text-red-500" : "text-foreground"}`}>
                    {item}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 transition-colors">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  Logout
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Partner Profile Section */}
           {loadingPartner ? (
  <SectionCard>
    <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
  </SectionCard>
) : isAdmin ? (
  <SectionCard>
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center shrink-0">
        <Briefcase className="w-5 h-5 text-background" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-foreground mb-1">Admin Dashboard</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          Manage partner applications, approve or reject listings.
        </p>
        <Button asChild className="rounded-full px-8 h-11 text-sm font-semibold shadow-none">
          <Link href="/admin">Go to Admin Panel</Link>
        </Button>
      </div>
    </div>
  </SectionCard>
) : partnerListing ? (
              /* Approved Partner View */
              <SectionCard>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h3 className="font-bold text-sm text-foreground">My Partner Profile</h3>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Live ✓</span>
                </div>

                {/* Cover image */}
                {partnerListing.coverImage && (
                  <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                    <img src={partnerListing.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="font-bold text-base">{partnerListing.name}</p>
                      <p className="text-xs opacity-80 capitalize">{partnerListing.type} · {partnerListing.category} · {partnerListing.city}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Rating", value: partnerListing.rating?.toFixed(1) ?? "—" },
                    { label: "Reviews", value: partnerListing.reviewCount ?? "0" },
                    { label: "Years Active", value: partnerListing.yearsActive ?? "—" },
                    { label: "Events Done", value: partnerListing.eventsCompleted ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1 rounded-full h-11 font-semibold" variant="outline">
                    <Link href={`/listing/${partnerListing.id}`}>
                      <Eye className="w-4 h-4 mr-2" /> View Public Profile
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-full h-11 font-semibold">
                    <Link href={`/listing/${partnerListing.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Link>
                  </Button>
                </div>
              </SectionCard>
            ) : application ? (
              /* Application Status View */
              <SectionCard>
                <div className="flex items-center gap-2.5 mb-4">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm text-foreground">Partner Application</h3>
                </div>
                <div className={`rounded-xl p-4 mb-4 ${application.status === "pending" ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}>
                  <p className={`text-sm font-semibold capitalize mb-1 ${application.status === "pending" ? "text-amber-800" : "text-red-800"}`}>
                    {application.status === "pending" ? "⏳ Application Under Review" : "❌ Application Rejected"}
                  </p>
                  <p className={`text-xs ${application.status === "pending" ? "text-amber-700" : "text-red-700"}`}>
                    {application.status === "pending"
                      ? "Our team is reviewing your application. We'll notify you within 3-5 business days."
                      : application.admin_notes ?? "Your application was not approved at this time."}
                  </p>
                </div>
                {application.status === "rejected" && (
                  <Button asChild className="rounded-full px-8 h-11 font-semibold w-full">
                   <Link href={`/join/edit/${application.id}`}>Apply Again</Link>
                  </Button>
                )}
              </SectionCard>
            ) : (
              /* No application — Become a Partner */
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
                    <Button asChild className="rounded-full px-8 h-11 text-sm font-semibold shadow-none">
  <Link href="/join">Apply Now</Link>
</Button>
                  </div>
                </div>
              </SectionCard>
            )}

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