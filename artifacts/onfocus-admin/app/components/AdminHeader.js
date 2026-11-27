"use client";

import { LogOutIcon } from "./Icons";

export default function AdminHeader({ adminUser, serverOnline, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-950 tracking-tight text-2xl">ONFOCUS</span>
          </div>
        </div>

        {/* Right: Server Status & Admin Profile & Logout */}
        <div className="flex items-center gap-4">
          {/* Admin User */}
          <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-zinc-200">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-900 leading-tight">
                {adminUser?.name || "Administrator"}
              </span>
              <span className="text-[11px] text-zinc-500 leading-tight">
                {adminUser?.email || "onfocusclub@gmail.com"}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
            >
              <LogOutIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
