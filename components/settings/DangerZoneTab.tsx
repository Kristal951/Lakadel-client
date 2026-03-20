import { User } from "@/store/types";
import { FiTrash2, FiAlertTriangle, FiArchive, FiShieldOff, FiInfo } from "react-icons/fi";

export default function DangerZone({ user }: { user: User | null }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Warning Header */}
      <section className="bg-foreground/10 border border-foreground/50 rounded-4xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500">
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-500">Handle with care</h2>
            <p className="text-sm text-red-500/90 mt-1 font-medium">
              Actions in this section are permanent and cannot be undone. Please ensure you have backed up any necessary data.
            </p>
          </div>
        </div>
      </section>

      {/* Account Deactivation (The "Soft" Option) */}
      <section className="bg-background rounded-4xl border border-foreground/30 shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center text-background">
              <FiArchive size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Archive Account</h3>
              <p className="text-sm text-foreground/60 font-medium">
                Temporarily disable your account. You can return anytime.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto px-6 py-3 border border-slate-200 text-foreground rounded-xl font-bold text-sm hover:bg-foreground/10 transition">
            Archive Lakadel Account
          </button>
        </div>
      </section>

      {/* Account Deletion (The "Permanent" Option) */}
      <section className="bg-background rounded-4xl border border-red-500 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-foreground/30 bg-background">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <FiShieldOff className="w-5 h-5" /> Delete Account & Data
          </h3>
          <p className="text-sm text-red-500/90 mt-1 font-medium">
            Once deleted, your profile, orders, and payment history will be purged.
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Before you go, please note:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                All active subscriptions will be cancelled immediately.
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Your ₦0.00 wallet balance will be forfeited.
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                This action is irreversible.
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-foreground/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium max-w-xs">
              By clicking delete, you acknowledge that you have read and understand the effects.
            </p>
            <button className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition shadow-xl shadow-rose-100 group">
              <FiTrash2 className="group-hover:animate-bounce" />
              Delete Permanently
            </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="flex justify-center items-center gap-2 text-slate-400">
        <FiInfo size={14} />
        <span className="text-xs font-medium">Need help? Contact support before taking these actions.</span>
      </div>
    </div>
  );
}