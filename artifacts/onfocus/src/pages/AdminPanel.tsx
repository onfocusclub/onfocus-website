import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const ADMIN_EMAILS = ["onfocusclub@gmail.com"];
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Status = "pending" | "approved" | "rejected";

interface Application {
  id: number;
  type: string;          
  name: string;          
  email: string;
  phone: string | null;
  city: string;
  category: string | null;
  description: string | null;
  price_range: string | null;
  website: string | null;
  portfolio_urls: string[];
  status: Status;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const STATUS_STYLES: Record<Status, string> = {
  pending:  "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const TYPE_EMOJI: Record<string, string> = {
  artist: "🎨", vendor: "🛍️", venue: "🏛️",
};

export default function AdminPanel() {
  const { user: currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) { navigate("/login"); return; }
    if (!ADMIN_EMAILS.includes(currentUser.email ?? "")) {
      navigate("/");
    }
  }, [currentUser, isLoading, navigate]);

  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination]     = useState<Pagination | null>(null);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [adminNotes, setAdminNotes]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res  = await fetch(`${API_BASE}/api/partner-applications?${params}`);
      const data = await res.json();
      setApplications(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      showToast("Failed to load applications", false);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  function openDrawer(app: Application) {
    setSelected(app);
    setAdminNotes(app.admin_notes ?? "");
    setDrawerOpen(true);
  }

  async function updateStatus(id: number, status: Status) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/partner-applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes, reviewedBy: currentUser?.email }),
      });
      if (!res.ok) throw new Error();
      const updated: Application = await res.json();
      setApplications(prev => prev.map(a => a.id === id ? updated : a));
      setSelected(updated);
      showToast(`Application ${status === "approved" ? "approved ✓" : "rejected ✗"}`, status === "approved");
    } catch {
      showToast("Failed to update status", false);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteApplication(id: number) {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      await fetch(`${API_BASE}/api/partner-applications/${id}`, { method: "DELETE" });
      setApplications(prev => prev.filter(a => a.id !== id));
      setDrawerOpen(false);
      showToast("Application deleted", true);
    } catch {
      showToast("Failed to delete", false);
    }
  }

  const total    = pagination?.total ?? applications.length;
  const pending  = applications.filter(a => a.status === "pending").length;
  const approved = applications.filter(a => a.status === "approved").length;
  const rejected = applications.filter(a => a.status === "rejected").length;

  const filtered = applications.filter(a =>
    search === "" ||
    a.business_name.toLowerCase().includes(search.toLowerCase()) ||
    a.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  );

  // Show loading spinner while Firebase auth loads
  if (isLoading) return <div className="min-h-screen bg-[#0f0f11]" />;

  // Not logged in or not admin
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email ?? "")) return null;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <span className="text-lg font-semibold tracking-tight">OnFocus Admin</span>
        </div>
        <span className="text-sm text-white/40">{currentUser.email}</span>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Partner Applications</h1>
          <p className="text-white/40 text-sm mt-1">Review, approve, or reject incoming partner requests</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",    value: total,    color: "from-white/10 to-white/5" },
            { label: "Pending",  value: pending,  color: "from-amber-500/20 to-amber-500/5" },
            { label: "Approved", value: approved, color: "from-emerald-500/20 to-emerald-500/5" },
            { label: "Rejected", value: rejected, color: "from-red-500/20 to-red-500/5" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl bg-gradient-to-br ${color} border border-white/10 p-4`}>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search by name, email, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500"
          />
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? "bg-violet-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">No applications found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/40 uppercase text-xs tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">City</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openDrawer(app)}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.business_name}</div>
                      <div className="text-white/40 text-xs">{app.contact_name}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize text-white/60">
                      {TYPE_EMOJI[app.partner_type] ?? "❓"} {app.partner_type}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-white/60">{app.city}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-white/40">{fmtDate(app.submitted_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${STATUS_STYLES[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-violet-400 hover:text-violet-300 text-xs" onClick={e => { e.stopPropagation(); openDrawer(app); }}>
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10">← Prev</button>
            <span className="text-white/40 text-sm">Page {page} / {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10">Next →</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {drawerOpen && selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#18181b] border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Application #{selected.id}</div>
                    <h2 className="text-xl font-bold">{selected.business_name}</h2>
                    <p className="text-white/50 text-sm capitalize">{TYPE_EMOJI[selected.partner_type]} {selected.partner_type} · {selected.city}</p>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs border capitalize ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Contact",     value: selected.contact_name },
                    { label: "Email",       value: selected.email },
                    { label: "Phone",       value: selected.phone ?? "—" },
                    { label: "City",        value: selected.city },
                    { label: "Price Range", value: selected.price_range ?? "—" },
                    { label: "Submitted",   value: fmtDate(selected.submitted_at) },
                    { label: "Reviewed",    value: fmtDate(selected.reviewed_at) },
                    { label: "Reviewed by", value: selected.reviewed_by ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{label}</div>
                      <div className="text-white/90 break-words">{value}</div>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-1">About</div>
                    <p className="text-white/80 text-sm leading-relaxed">{selected.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Admin Notes (optional)</label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="Reason for approval/rejection…" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500 resize-none" />
                </div>

                <div className="flex gap-3">
                  <button disabled={actionLoading || selected.status === "approved"} onClick={() => updateStatus(selected.id, "approved")} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-medium text-sm transition-colors">
                    {actionLoading ? "…" : "✓ Approve"}
                  </button>
                  <button disabled={actionLoading || selected.status === "rejected"} onClick={() => updateStatus(selected.id, "rejected")} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 font-medium text-sm transition-colors">
                    {actionLoading ? "…" : "✗ Reject"}
                  </button>
                </div>

                <button onClick={() => deleteApplication(selected.id)} className="w-full py-2 rounded-lg border border-white/10 text-white/40 hover:border-red-500/50 hover:text-red-400 text-sm transition-colors">
                  Delete application
                </button>

                {selected.admin_notes && (
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-white/40 text-xs mb-1">Previous notes</div>
                    <p className="text-white/70 text-sm">{selected.admin_notes}</p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50 ${toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
