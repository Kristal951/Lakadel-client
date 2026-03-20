"use client";
import { User } from "@/store/types";
import { useState } from "react";
import {
  FiShield,
  FiSmartphone,
  FiKey,
  FiGlobe,
  FiAlertCircle,
  FiClock,
  FiLogOut,
} from "react-icons/fi";
import { ChangePasswordModal } from "./ChangePasswordModal";

export default function SecurityTab({ user }: { user: User | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-foreground rounded-4xl p-8 text-background">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FiShield className="text-emerald-400 w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-background">
              Security Health: Strong
            </h2>
          </div>
          <p className="text-background/80 text-sm mb-6 max-w-sm">
            Your account is well protected. To reach 100%, consider updating
            your password every 6 months.
          </p>
          <div className="w-full h-2 bg-gray-500 rounded-full overflow-hidden">
            <div className="h-full bg-background w-[85%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        <div className="bg-white rounded-4xl border border-foreground/30 p-8 shadow-sm flex flex-col justify-center items-center text-center">
          <FiKey className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
            2FA Status
          </h3>
          <span className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase">
            Enabled
          </span>
        </div>
      </section>

      <section className="bg-background rounded-4xl border border-foreground/30  overflow-hidden">
        <div className="p-8 border-b border-foreground/30 bg-background">
          <h2 className="text-xl font-bold text-foreground">Password</h2>
          <p className="text-sm text-foreground/60">
            Last changed 3 months ago (Oct 2025)
          </p>
        </div>
        <div className="p-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center">
              <FiLockIcon className="text-background" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Change your password
              </p>
              <p className="text-xs text-foreground/60 font-medium">
                Use at least 12 characters and a mix of symbols.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-foreground/95 text-background rounded-xl font-bold text-sm hover:bg-foreground transition shadow-sm"
          >
            Update Password
          </button>
        </div>
      </section>

      <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-foreground/30 bg-background flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Active Sessions
            </h2>
            <p className="text-sm text-foreground/60">
              Devices currently logged into your account.
            </p>
          </div>
          <button className="text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/10 px-3 py-2 rounded-lg transition">
            Sign out all
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          <SessionItem
            device="MacBook Pro 16”"
            browser="Chrome • Lagos, Nigeria"
            status="Current Session"
            isCurrent
            icon={<FiMonitorIcon className="w-5 h-5" />}
          />
          <SessionItem
            device="iPhone 15 Pro"
            browser="Safari • Abuja, Nigeria"
            status="Active 2 hours ago"
            icon={<FiSmartphone className="w-5 h-5" />}
          />
        </div>
      </section>
        <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

function SessionItem({ device, browser, status, isCurrent, icon }: any) {
  return (
    <div className="p-8 flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isCurrent ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:border-slate-200"}`}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">{device}</p>
            {isCurrent && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/60 font-medium">{browser}</p>
        </div>
      </div>
      {!isCurrent && (
        <button className="p-2 text-foreground/40 hover:text-rose-500 transition-colors">
          <FiLogOut className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function FiLockIcon(props: any) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
function FiMonitorIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8m-4-3v3" />
    </svg>
  );
}
