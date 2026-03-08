import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CheckCircle, Calculator, Banknote,
  CalendarCheck, CreditCard, HandCoins, AlertTriangle, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut, Cog, ShieldCheck, PiggyBank, ShieldOff, UserCheck, X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.png";

const navItems = [
  { labelKey: "navDashboard", icon: LayoutDashboard, path: "/", module: "Dashboard" },
  { labelKey: "navEmployees", icon: Users, path: "/employees", module: "Employees" },
  { labelKey: "navLoanTypes", icon: Settings, path: "/loan-types", module: "Loan Types" },
  { labelKey: "navApplications", icon: FileText, path: "/applications", module: "Applications" },
  { labelKey: "navApprovals", icon: CheckCircle, path: "/approvals", module: "Approvals" },
  { labelKey: "navGuaranteeApprovals", icon: UserCheck, path: "/guarantee-approvals", module: "Guarantee Approvals" },
  { labelKey: "navDisbursements", icon: Banknote, path: "/disbursements", module: "Disbursements" },
  { labelKey: "navRepaymentSchedule", icon: CalendarCheck, path: "/repayments", module: "Repayment Schedule" },
  { labelKey: "navPayrollDeductions", icon: CreditCard, path: "/deductions", module: "Payroll Deductions" },
  { labelKey: "navManualPayments", icon: HandCoins, path: "/manual-payments", module: "Manual Payments" },
  { labelKey: "navOverdueTracking", icon: AlertTriangle, path: "/overdue", module: "Overdue Tracking" },
  { labelKey: "navReports", icon: BarChart3, path: "/reports", module: "Reports" },
  { labelKey: "navSavings", icon: PiggyBank, path: "/savings", module: "Savings" },
  { labelKey: "navGuaranteeDeactivation", icon: ShieldOff, path: "/guarantee-deactivation", module: "Applications" },
  { labelKey: "navSettings", icon: Cog, path: "/settings", module: "Settings" },
  { labelKey: "navPermissions", icon: ShieldCheck, path: "/permissions", module: "Permissions" },
] as const;

interface Props {
  onCloseMobile?: () => void;
}

export default function AppSidebar({ onCloseMobile }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, role, signOut } = useAuth();
  const { canView, loading: permLoading } = usePermissions();
  const { settings } = useCompanySettings();
  const { t } = useLanguage();

  const roleLabels: Record<string, string> = {
    admin: t.roleAdmin,
    manager: t.roleManager,
    finance: t.roleFinance,
    employee: t.roleEmployee,
  };

  const visibleItems = navItems.filter((item) => canView(item.module));

  const displayLogo = settings?.logo_url || logo;
  const displayName = settings?.company_name || "Addis Microfinance";

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <aside
      className={`h-screen bg-sidebar flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[250px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <img src={displayLogo} alt={displayName} className="w-8 h-8 rounded-lg flex-shrink-0 object-contain" />
        {!collapsed && (
          <span className="font-display text-sm font-bold text-sidebar-primary-foreground truncate flex-1">
            {displayName}
          </span>
        )}
        {/* Close button on mobile */}
        {!collapsed && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4 text-sidebar-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const active = location.pathname === item.path;
          const label = t[item.labelKey];
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`sidebar-link ${active ? "sidebar-link-active" : "sidebar-link-inactive"}`}
              title={collapsed ? label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
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
            title={t.signOut}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">{t.signOut}</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center px-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
