import { FiCheck } from "react-icons/fi";

export function ChannelCard({ icon, label, status, active }: any) {
  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
      active ? 'bg-background border-foreground/30 shadow-sm' : 'bg-background border-transparent opacity-60'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-foreground text-background' : 'bg-slate-200 text-slate-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[10px] font-black uppercase tracking-wide text-foreground/60">{status}</p>
      </div>
      {active && <FiCheck className="ml-auto text-emerald-500" />}
    </div>
  );
}