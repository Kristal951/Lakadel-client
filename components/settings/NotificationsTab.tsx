import { FiMail, FiBell, FiSmartphone, FiCheck, FiInfo } from "react-icons/fi";
import { ChannelCard } from "./ChannelCard";
import { User } from "@/store/types";

const notificationGroups = [
  {
    title: "Transactional",
    description: "Essential updates regarding your orders and account activity.",
    items: [
      { id: "order_updates", title: "Order status", desc: "Payments, shipping, and delivery updates." },
      { id: "security_alerts", title: "Security alerts", desc: "New logins and account recovery attempts." },
    ],
  },
  {
    title: "Marketing",
    description: "Stay in the loop with new products and seasonal offers.",
    items: [
      { id: "promos", title: "Promotions & discounts", desc: "Exclusive sales and early access to drops." },
      { id: "newsletter", title: "Weekly digest", desc: "A summary of what's trending at Lakadel." },
    ],
  },
];

export default function NotificationsTab({ user }: { user: User | null }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Global Channel Settings */}
      <section className="bg-background rounded-4xl border border-foreground/30 overflow-hidden">
        <div className="p-8 border-b border-foreground/30 bg-background">
          <h2 className="text-xl font-bold text-foreground">Notification Channels</h2>
          <p className="text-sm text-foreground/60 font-medium">Choose where you want to receive updates.</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChannelCard icon={<FiMail />} label="Email" status="Active" active />
          <ChannelCard icon={<FiBell />} label="Push" status="Browser" active />
          <ChannelCard icon={<FiSmartphone />} label="SMS" status="Not set" />
        </div>
      </section>

      <div className="space-y-6">
        {notificationGroups.map((group) => (
          <section key={group.title} className="bg-background rounded-4xl border border-foreground/30 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-foreground/30">
              <h3 className="text-lg font-bold text-foreground">{group.title}</h3>
              <p className="text-sm text-foreground/60">{group.description}</p>
            </div>
            <div className="divide-y divide-foreground/50 px-4">
              {group.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between group">
                  <div className="max-w-md">
                    <p className="text-sm font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-foreground/60 font-medium mt-1">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <Toggle active={item.id.includes('order') || item.id.includes('security')} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Helper Info Card */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
        <FiInfo className="text-indigo-600 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed font-medium">
          <strong>Note:</strong> Some critical notifications, like password resets and legal updates, cannot be turned off to ensure the safety of your account.
        </p>
      </div>
    </div>
  );
}

/* Sub-components */


function Toggle({ active }: { active?: boolean }) {
  return (
    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
      active ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-200'
    }`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </div>
  );
}