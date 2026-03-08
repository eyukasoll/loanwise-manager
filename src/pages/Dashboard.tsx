import React from "react";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { useLoanApplications, useEmployees } from "@/hooks/useLoans";
import {
  FileText, CheckCircle, Banknote, DollarSign, AlertTriangle,
  TrendingUp, Users, ArrowRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router-dom";
import { fmtShort as fmtS, fmt } from "@/lib/currency";
import { useLanguage } from "@/i18n/LanguageContext";

const COLORS = [
  "hsl(217, 72%, 48%)", "hsl(162, 63%, 41%)", "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 51%)"
];

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: applications = [], isLoading } = useLoanApplications();
  const { data: employees = [] } = useEmployees();

  const activeLoans = applications.filter((l: any) => l.status === "Active");
  const pendingApproval = applications.filter((l: any) => ["Pending Approval", "Under Review", "Submitted"].includes(l.status));
  const totalDisbursed = applications.filter((l: any) => ["Active", "Closed", "Disbursed"].includes(l.status)).reduce((s: number, l: any) => s + (l.approved_amount || l.requested_amount || 0), 0);
  const totalRecovered = applications.reduce((s: number, l: any) => s + (l.total_paid || 0), 0);
  const totalOutstanding = activeLoans.reduce((s: number, l: any) => s + (l.outstanding_balance || 0), 0);
  const overdueCount = activeLoans.filter((l: any) => l.next_due_date && new Date(l.next_due_date) < new Date()).length;
  const closedCount = applications.filter((l: any) => l.status === "Closed").length;

  // Loan type distribution
  const typeMap: Record<string, { name: string; count: number }> = {};
  applications.forEach((l: any) => {
    const name = l.loan_types?.name || "Unknown";
    if (!typeMap[name]) typeMap[name] = { name, count: 0 };
    typeMap[name].count++;
  });
  const typeDistribution = Object.values(typeMap);

  // Department distribution
  const deptMap: Record<string, { name: string; amount: number }> = {};
  applications.filter((l: any) => ["Active", "Closed", "Disbursed"].includes(l.status)).forEach((l: any) => {
    const dept = l.employees?.department || "Unknown";
    if (!deptMap[dept]) deptMap[dept] = { name: dept, amount: 0 };
    deptMap[dept].amount += l.approved_amount || l.requested_amount || 0;
  });
  const deptDistribution = Object.values(deptMap);

  return (
    <div>
      <TopBar title={t.dashTitle} subtitle={t.dashSubtitle} />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t.navApplications} value={applications.length} icon={FileText} variant="primary" />
          <StatCard label={t.pendingApproval} value={pendingApproval.length} icon={CheckCircle} variant="warning" />
          <StatCard label={t.totalDisbursed} value={fmtS(totalDisbursed)} icon={Banknote} variant="accent" />
          <StatCard label={t.totalOutstanding} value={fmtS(totalOutstanding)} icon={DollarSign} variant="destructive" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t.totalRecovered} value={fmtS(totalRecovered)} icon={TrendingUp} variant="accent" />
          <StatCard label={t.activeLoans} value={activeLoans.length} icon={Users} variant="primary" />
          <StatCard label={t.overdueLoans} value={overdueCount} icon={AlertTriangle} variant="destructive" />
          <StatCard label={t.closedLoans} value={closedCount} icon={CheckCircle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm mb-4">{t.loansByDept}</h3>
            {deptDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptDistribution} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="amount" name="Amount" fill="hsl(217, 72%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">{t.noDataYet}</div>
            )}
          </div>

          {/* Type pie */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm mb-4">{t.loanTypeDist}</h3>
            {typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={typeDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">{t.noDataYet}</div>
            )}
          </div>
        </div>

        {/* Recent applications */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-display font-semibold text-sm">{t.recentApplications}</h3>
            <Link to="/applications" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">{t.viewAll} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.applicationId}</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.employee}</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.type}</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs">{t.amount}</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.status}</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">{t.loading}</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No applications yet. Start by adding employees and loan types.</td></tr>
                ) : applications.slice(0, 5).map((loan: any) => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{loan.application_number}</td>
                    <td className="px-5 py-3">{loan.employees?.full_name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{loan.loan_types?.name}</td>
                    <td className="px-5 py-3 text-right font-medium">{fmtS(loan.requested_amount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={loan.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{loan.application_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
