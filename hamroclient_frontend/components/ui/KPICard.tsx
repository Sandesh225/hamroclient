"use client";

import { useState, useEffect, useRef } from "react";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

interface KPICardProps {
  label?: string; // Admin style
  title?: string; // Staff style
  value: number;
  change?: number; // Admin style (percentage)
  trend?: string; // Staff style (text string)
  icon: LucideIcon;
  suffix?: string;
  delay?: number;
  color?: "primary" | "accent" | "destructive" | "muted" | "success";
}

const colorMap = {
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent-foreground border-accent/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function KPICard({
  label,
  title,
  value,
  change,
  trend,
  icon: Icon,
  suffix = "",
  delay = 0,
  color = "primary",
}: KPICardProps) {
  const animatedValue = useCountUp(value);
  
  // Decide between Admin dashboard change (percentage) or Staff dashboard trend (text)
  const isPositive = (change !== undefined && change >= 0) || color === "success" || color === "primary";

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
      style={delay > 0 ? { animation: `countUp 0.5s ease-out ${delay}ms both` } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 w-full relative">
          {/* Top Label/Title & Trend Area for Admin View vs Staff View */}
          {change !== undefined ? (
            // Admin View Layout
            <>
              <div className="flex items-start justify-between w-full mb-3">
                <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    isPositive ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {animatedValue}{suffix}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </>
          ) : (
            // Staff View Layout
            <div className="flex items-start justify-between w-full">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{title || label}</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {animatedValue}{suffix}
                </p>
                {trend && (
                  <p className="text-xs text-muted-foreground">{trend}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg border shrink-0 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
