// API client for Onfocus Admin Panel

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getAuthHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function safeJson(res, defaultErrorMsg = "Request failed") {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      if (text.includes("Cannot POST") || text.includes("Cannot GET") || text.includes("<!DOCTYPE")) {
        throw new Error(
          `API endpoint not found (${res.status}). Please ensure the api-server is running on port 3000 and restarted.`
        );
      }
      throw new Error(text || `${defaultErrorMsg} (${res.status})`);
    }
    return { success: true, text };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `${defaultErrorMsg} (${res.status})`);
  }
  return data;
}

// -----------------------------------------------------------------------------
// Admin Authentication
// -----------------------------------------------------------------------------
export async function adminLogin(identifier, password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return await safeJson(res, "Failed to log in as admin");
}

export async function adminVerify(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) return null;
    return await safeJson(res, "Auth verification failed");
  } catch (err) {
    console.warn("Auth verification failed:", err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Events CRUD
// -----------------------------------------------------------------------------
export async function fetchEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.city && params.city !== "all") query.set("city", params.city);
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${API_BASE}/api/events${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url);
  return await safeJson(res, "Failed to fetch events");
}

export async function fetchEventById(id) {
  const res = await fetch(`${API_BASE}/api/events/${id}`);
  return await safeJson(res, `Failed to fetch event #${id}`);
}

export async function createEvent(eventData, token) {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(eventData),
  });
  return await safeJson(res, "Failed to create event");
}

export async function updateEvent(id, eventData, token) {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(eventData),
  });
  return await safeJson(res, "Failed to update event");
}

export async function deleteEvent(id, token) {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return await safeJson(res, "Failed to delete event");
}

// -----------------------------------------------------------------------------
// Event Categories CRUD
// -----------------------------------------------------------------------------
export async function fetchEventCategories(params = {}) {
  const query = new URLSearchParams();
  if (params.all || params.includeInactive) query.set("all", "true");

  const url = `${API_BASE}/api/event-categories${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url);
  return await safeJson(res, "Failed to fetch event categories");
}

export async function createEventCategory(categoryData, token) {
  const res = await fetch(`${API_BASE}/api/event-categories`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(categoryData),
  });
  return await safeJson(res, "Failed to create category");
}

export async function updateEventCategory(id, categoryData, token) {
  const res = await fetch(`${API_BASE}/api/event-categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(categoryData),
  });
  return await safeJson(res, "Failed to update category");
}

export async function deleteEventCategory(id, token) {
  const res = await fetch(`${API_BASE}/api/event-categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return await safeJson(res, "Failed to delete category");
}

// -----------------------------------------------------------------------------
// Cloudinary Image Upload from Device
// -----------------------------------------------------------------------------
export async function uploadEventImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/uploads/image`, {
    method: "POST",
    headers,
    body: formData,
  });

  return await safeJson(res, "Failed to upload image to Cloudinary");
}

// -----------------------------------------------------------------------------
// Server Health
// -----------------------------------------------------------------------------
export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
    if (res.ok) return true;
    const res2 = await fetch(`${API_BASE}/api/healthz`, { method: "GET" });
    return res2.ok;
  } catch {
    return false;
  }
}
