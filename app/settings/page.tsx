"use client";

import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiLock,
  FiBell,
  FiTrash2,
  FiCreditCard,
  FiMonitor,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import clsx from "clsx";
import ProfileTab from "@/components/settings/ProfileTab";
import BillingInfoTab from "@/components/settings/BillingInfoTab";
import SecurityTab from "@/components/settings/SecurityTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import DangerZone from "@/components/settings/DangerZoneTab";
import AppearanceTab from "@/components/settings/AppearanceTab";
import { ArrowLeft } from "lucide-react";
import useUserStore from "@/store/userStore";
import { useSettingsDraftStore } from "@/store/settingsDraftStore";

const categories = [
  { id: "profile", name: "Public Profile", icon: FiUser },
  { id: "security", name: "Security", icon: FiShield },
  { id: "notifications", name: "Notifications", icon: FiBell },
  { id: "appearance", name: "Appearance", icon: FiMonitor },
  { id: "billing", name: "Billing Information", icon: FiCreditCard },
  { id: "danger", name: "Danger Zone", icon: FiTrash2, color: "text-red-500" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useUserStore();
  const { draft, setField, hydrateFromUser } = useSettingsDraftStore();

   useEffect(() => {
    hydrateFromUser(user);
  }, [user, hydrateFromUser]);


  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 px-4">
        <button className="flex items-center justify-center mb-6 gap-1" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-foreground/70 mt-2 font-medium">
          Manage your account preferences and configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === cat.id
                  ? "bg-foreground text-background"
                  : "text-foreground/60 hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <cat.icon className={clsx("w-5 h-5", cat.color)} />
              {cat.name}
            </button>
          ))}
        </aside>

        <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === "profile" && <ProfileTab user={user}/>}

          {activeTab === "billing" && <BillingInfoTab user={user}/>}

          {activeTab === "security" && <SecurityTab user={user}/>}

          {activeTab === "notifications" && <NotificationsTab user={user}/>}

          {activeTab === "danger" && <DangerZone user={user}/>}
          
          {activeTab === "appearance" && <AppearanceTab user={user}/>}

          <div className="pt-6 flex items-center justify-between border-t border-slate-100">
            <p className="text-xs text-slate-400 italic">
              Last saved: 2 minutes ago
            </p>
            <button className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 group">
              <FiCheck className="group-hover:scale-125 transition-transform" />
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
