"use client";

import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "accent" | "destructive" | "muted";
}

const colorMap = {
  primary:
    "bg-primary/10 text-primary border-primary/20",
  accent:
    "bg-accent/10 text-accent-foreground border-accent/20",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/20",
  muted:
    "bg-muted text-muted-foreground border-border",
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg border ${colorMap[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
