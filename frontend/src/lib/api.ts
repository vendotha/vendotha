// API base — reads from .env at build time, falls back to Render URL
export const API_BASE = import.meta.env.VITE_API_URL || "https://vendotha-api.onrender.com";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error ${res.status}`);
  }
  return res;
}

// ── Public reads (no auth) ─────────────────────────────────────────────────

export async function fetchProfile() {
  const res = await apiFetch("/api/profile");
  return res.json();
}

export async function fetchSkills() {
  const res = await apiFetch("/api/skills");
  return res.json();
}

export async function fetchExperience() {
  const res = await apiFetch("/api/experience");
  return res.json();
}

export async function fetchPosts() {
  const res = await apiFetch("/api/posts");
  return res.json();
}

// ── Admin writes (require Firebase ID token) ──────────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function updateProfile(token: string, formData: FormData) {
  const res = await apiFetch("/api/profile", {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  return res.json();
}

export async function updateSkills(token: string, categories: { title: string; skills: string[] }[]) {
  const res = await apiFetch("/api/skills", {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  });
  return res.json();
}

export async function updateExperience(token: string, items: any[]) {
  const res = await apiFetch("/api/experience", {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  return res.json();
}

export async function createPost(token: string, formData: FormData) {
  const res = await apiFetch("/api/posts", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  return res.json();
}

export async function updatePost(token: string, postId: string, formData: FormData) {
  const res = await apiFetch(`/api/posts/${postId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: formData,
  });
  return res.json();
}

export async function deletePost(token: string, postId: string) {
  const res = await apiFetch(`/api/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return res.json();
}