"use client";

import { useState } from "react";
import { adminLogin } from "../lib/api";

export default function LoginForm({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await adminLogin(identifier, password);
      if (res && res.token) {
        localStorage.setItem("onfocus_admin_token", res.token);
        localStorage.setItem("onfocus_admin_user", JSON.stringify(res.user));
        onLoginSuccess(res.user, res.token);
      } else {
        throw new Error("No authorization token received.");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-semibold tracking-wider text-zinc-800 uppercase mb-4">
              Admin Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 font-sans">
              ONFOCUS
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sign in to manage live events, categories, and ticketing
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-sm rounded-xl">
              <div className="font-medium">Authentication Failed</div>
              <div className="text-xs mt-0.5 text-red-600">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@onfocus.club"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                "Sign In to Admin Dashboard"
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-zinc-400 mt-6">
          © {new Date().getFullYear()} Onfocus Media & Club. All rights reserved.
        </div>
      </div>
    </div>
  );
}
