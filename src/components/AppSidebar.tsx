import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CheckCircle, Calculator, Banknote,
  CalendarCheck, CreditCard, HandCoins, AlertTriangle, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Employees", icon: Users, path: "/employees" },
  { label: "Loan Types", icon: Settings, path: "/loan-types" },
  { label: "Applications", icon: FileText, path: "/applications" },
  { label: "Approvals", icon: CheckCircle, path: "/approvals" },
  { label: "Disbursements", icon: Banknote, path: "/disbursements" },
  { label: "Repayment Schedule", icon: CalendarCheck, path: "/repayments" },
  { label: "Payroll Deductions", icon: CreditCard, path: "/deductions" },
  { label: "Manual Payments", icon: HandCoins, path: "/manual-payments" },
  { label: "Overdue Tracking", icon: AlertTriangle, path: "/overdue" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, signOut } = useAuth();

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    finance: "Finance",
    employee: "Employee",
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar flex flex-col z-40 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[250px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display text-base font-bold text-sidebar-primary-foreground truncate">
            LoanManager
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? "sidebar-link-active" : "sidebar-link-inactive"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Sign out */}
      <div className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-sidebar-foreground truncate opacity-70">{user.email}</span>
            {role && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary-foreground whitespace-nowrap">
                {roleLabels[role] || role}
              </span>
            )}
          </div>
        )}
        <div className="flex">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center px-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
