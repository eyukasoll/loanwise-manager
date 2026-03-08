import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "primary" | "accent" | "warning" | "destructive";
}

const variantStyles = {
  default: "border-border",
  primary: "border-l-4 border-l-primary",
  accent: "border-l-4 border-l-accent",
  warning: "border-l-4 border-l-warning",
  destructive: "border-l-4 border-l-destructive",
};

const iconBg = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export default function StatCard({ label, value, icon: Icon, trend, trendUp, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("stat-card", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold font-display">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-success" : "text-destructive")}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
