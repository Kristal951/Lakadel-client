import { useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiX, FiCheckCircle } from "react-icons/fi";

export function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
      />
      
      <div className="relative w-full max-w-md bg-background rounded-[2.5rem] border border-foreground/10 shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <header className="mb-8 flex items-center justify-center flex-col w-full">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <FiLock className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Update Password</h2>
          <p className="text-sm text-foreground/60">Secure your account with a unique password.</p>
        </header>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 ml-1">Current Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              placeholder="••••••••••••"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2 ml-1">New Password</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                placeholder="••••••••••••"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground">
                <FiEye className="w-5 h-5" />
              </button>
            </div>
            
            {/* Strength Meter */}
            <div className="flex gap-1 px-1">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className={`h-1 flex-1 rounded-full ${step <= 2 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button className="w-full py-4 bg-foreground text-background rounded-2xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-foreground/10">
              Save New Password
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-transparent text-foreground/60 rounded-2xl font-bold text-sm hover:bg-foreground/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}