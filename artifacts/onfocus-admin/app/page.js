"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "./components/AdminHeader";
import LoginForm from "./components/LoginForm";
import EventsTable from "./components/EventsTable";
import EventModal from "./components/EventModal";
import DeleteModal from "./components/DeleteModal";
import CategoriesTable from "./components/CategoriesTable";
import CategoryModal from "./components/CategoryModal";
import DeleteCategoryModal from "./components/DeleteCategoryModal";
import {
  adminVerify,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  checkServerStatus,
} from "./lib/api";
import {
  CalendarIcon,
  TagIcon,
  CheckIcon,
  XIcon,
} from "./components/Icons";

export default function AdminPage() {
  // Navigation tab state: "events" | "categories"
  const [activeTab, setActiveTab] = useState("events");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Server health state
  const [serverOnline, setServerOnline] = useState(true);

  // Events list state
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  // Categories list state
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Event Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Category Modal states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isCategoryDeleting, setIsCategoryDeleting] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Initial Auth Check
  useEffect(() => {
    const token = localStorage.getItem("onfocus_admin_token");
    const storedUser = localStorage.getItem("onfocus_admin_user");

    if (token) {
      setAdminToken(token);
      if (storedUser) {
        try {
          setAdminUser(JSON.parse(storedUser));
        } catch {
          // ignore
        }
      }
      adminVerify(token)
        .then((res) => {
          if (res?.authenticated) {
            setIsAuthenticated(true);
            if (res.user) setAdminUser(res.user);
          } else {
            localStorage.removeItem("onfocus_admin_token");
            localStorage.removeItem("onfocus_admin_user");
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAuthenticated(true);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }

    checkServerStatus().then((online) => setServerOnline(online));
  }, []);

  // 2. Fetch Events
  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetchEvents({
        category: selectedCategory,
        city: selectedCity,
        search: searchTerm,
        limit: 100,
      });
      if (res && Array.isArray(res.events)) {
        setEvents(res.events);
      } else if (Array.isArray(res)) {
        setEvents(res);
      }
      setServerOnline(true);
    } catch (err) {
      console.error("Failed to load events:", err);
      showToast(err.message || "Could not load events from server.", "error");
      setServerOnline(false);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [selectedCategory, selectedCity, searchTerm]);

  // 3. Fetch Categories
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetchEventCategories({ includeInactive: true });
      if (res && Array.isArray(res.categories)) {
        setCategories(res.categories);
      } else if (Array.isArray(res)) {
        setCategories(res);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
      loadCategories();
    }
  }, [isAuthenticated, loadEvents, loadCategories]);

  // Handle Login Success
  const handleLoginSuccess = (user, token) => {
    setAdminUser(user);
    setAdminToken(token);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name || "Admin"}!`);
    loadEvents();
    loadCategories();
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("onfocus_admin_token");
    localStorage.removeItem("onfocus_admin_user");
    setAdminToken(null);
    setAdminUser(null);
    setIsAuthenticated(false);
    showToast("Signed out of admin portal.");
  };

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleCreateEvent = async (eventData) => {
    setIsSubmitting(true);
    try {
      await createEvent(eventData, adminToken);
      setIsAddModalOpen(false);
      showToast("Event created successfully!");
      await loadEvents();
      await loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to create event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    if (!editingEvent) return;
    setIsSubmitting(true);
    try {
      await updateEvent(editingEvent.id, eventData, adminToken);
      setEditingEvent(null);
      showToast("Event updated successfully!");
      await loadEvents();
      await loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to update event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deletingEvent.id, adminToken);
      showToast(`Event “${deletingEvent.title}” deleted successfully.`);
      setDeletingEvent(null);
      await loadEvents();
      await loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to delete event", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Category Handlers
  // ---------------------------------------------------------------------------
  const handleCreateCategory = async (categoryData) => {
    setIsCategorySubmitting(true);
    try {
      await createEventCategory(categoryData, adminToken);
      setIsAddCategoryOpen(false);
      showToast(`Category "${categoryData.name}" created!`);
      await loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to create category", "error");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    if (!editingCategory) return;
    setIsCategorySubmitting(true);
    try {
      await updateEventCategory(editingCategory.id, categoryData, adminToken);
      setEditingCategory(null);
      showToast(`Category updated successfully!`);
      await loadCategories();
      await loadEvents();
    } catch (err) {
      showToast(err.message || "Failed to update category", "error");
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsCategoryDeleting(true);
    try {
      await deleteEventCategory(deletingCategory.id, adminToken);
      showToast(`Category "${deletingCategory.name}" deleted.`);
      setDeletingCategory(null);
      await loadCategories();
      await loadEvents();
    } catch (err) {
      showToast(err.message || "Failed to delete category", "error");
    } finally {
      setIsCategoryDeleting(false);
    }
  };

  // Metrics
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => (e.status || "active") === "active").length;
  const featuredEvents = events.filter((e) => Boolean(e.featured)).length;
  const uniqueCities = new Set(events.map((e) => e.city).filter(Boolean)).size;

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive !== false && c.is_active !== false).length;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-medium">Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-zinc-900 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-3 duration-200 max-w-md">
          <div
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${toast.type === "error"
                ? "bg-red-950 text-white border-red-800"
                : "bg-zinc-950 text-white border-zinc-800"
              }`}
          >
            {toast.type === "error" ? (
              <XIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <AdminHeader
        adminUser={adminUser}
        serverOnline={serverOnline}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab Switcher & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "events"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                }`}
            >
              Live Events ({totalEvents})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${activeTab === "categories"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                }`}
            >
              Event Categories ({totalCategories})
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EVENTS MANAGEMENT                                       */}
        {/* ============================================================== */}
        {activeTab === "events" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Total Events
                </div>
                <div className="text-2xl font-extrabold text-zinc-950 mt-1">
                  {totalEvents}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Across database records
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Active Events
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {activeEvents}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Visible on site
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Featured Carousel
                </div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {featuredEvents}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Homepage hero showcase
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Active Cities
                </div>
                <div className="text-2xl font-extrabold text-zinc-950 mt-1">
                  {uniqueCities}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Locations covered
                </div>
              </div>
            </div>

            {/* Events Table Component */}
            <EventsTable
              events={events}
              categories={categories}
              isLoading={isLoadingEvents}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedCity={selectedCity}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategory}
              onCityChange={setSelectedCity}
              onRefresh={loadEvents}
              onAddNew={() => setIsAddModalOpen(true)}
              onEdit={(event) => setEditingEvent(event)}
              onDelete={(event) => setDeletingEvent(event)}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CATEGORIES MANAGEMENT                                   */}
        {/* ============================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Metric Cards for Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Total Categories
                </div>
                <div className="text-2xl font-extrabold text-zinc-950 mt-1">
                  {totalCategories}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Available in dropdowns & filters
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Active Categories
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {activeCategories}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Shown to public audience
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs col-span-2 md:col-span-1">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Total Live Events
                </div>
                <div className="text-2xl font-extrabold text-zinc-950 mt-1">
                  {totalEvents}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Assigned across categories
                </div>
              </div>
            </div>

            {/* Categories Table */}
            <CategoriesTable
              categories={categories}
              isLoading={isLoadingCategories}
              onRefresh={loadCategories}
              onAddNew={() => setIsAddCategoryOpen(true)}
              onEdit={(cat) => setEditingCategory(cat)}
              onDelete={(cat) => setDeletingCategory(cat)}
            />
          </div>
        )}
      </main>

      {/* Add Event Modal */}
      <EventModal
        isOpen={isAddModalOpen}
        mode="add"
        categories={categories}
        adminToken={adminToken}
        isSubmitting={isSubmitting}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEvent}
      />

      {/* Edit Event Modal */}
      <EventModal
        isOpen={Boolean(editingEvent)}
        mode="edit"
        categories={categories}
        eventData={editingEvent}
        adminToken={adminToken}
        isSubmitting={isSubmitting}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleUpdateEvent}
      />

      {/* Delete Event Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingEvent)}
        event={deletingEvent}
        isDeleting={isDeleting}
        onCancel={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
      />

      {/* Add Category Modal */}
      <CategoryModal
        isOpen={isAddCategoryOpen}
        mode="add"
        isSubmitting={isCategorySubmitting}
        onClose={() => setIsAddCategoryOpen(false)}
        onSubmit={handleCreateCategory}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={Boolean(editingCategory)}
        mode="edit"
        categoryData={editingCategory}
        isSubmitting={isCategorySubmitting}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
      />

      {/* Delete Category Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        category={deletingCategory}
        isDeleting={isCategoryDeleting}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <div>
            ONFOCUS Admin Panel • Connected to Express API Server ({serverOnline ? "Online" : "Connecting..."})
          </div>
          <div>
            Built with Next.js & Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
