"use client";

import { useState } from "react";
import { Bell, Mail, AlertTriangle, Calendar, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const INITIAL_SETTINGS: NotificationSetting[] = [
  { id: "status_change", label: "Status Change Emails", description: "Send email notifications when an application status changes", icon: FileText, enabled: true },
  { id: "passport_expiry", label: "Passport Expiry Alerts", description: "Alert 30 days before passport expiration", icon: AlertTriangle, enabled: true },
  { id: "medical_expiry", label: "Medical Cert Expiry Alerts", description: "Alert 30 days before medical certificate expiration", icon: AlertTriangle, enabled: true },
  { id: "weekly_summary", label: "Weekly Summary Email", description: "Receive a weekly digest of all activity and metrics", icon: Calendar, enabled: false },
];

export default function NotificationSettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const toggleSetting = async (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
    addToast("success", "Setting Updated", "Notification preference saved.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure email and in-app notification preferences.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <div key={setting.id} className="flex items-center gap-4 px-5 py-4">
              <div className="p-2.5 rounded-lg bg-muted">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{setting.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
              </div>
              <button
                onClick={() => toggleSetting(setting.id)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  setting.enabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    setting.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
