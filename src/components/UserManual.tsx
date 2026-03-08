import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Banknote,
  CalendarCheck,
  Receipt,
  HandCoins,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  PiggyBank,
  ShieldCheck,
  ShieldOff,
  BookOpen,
  Printer,
  Download,
  Upload,
  Share2,
} from "lucide-react";

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  content: {
    overview: string;
    features: string[];
    howTo: { title: string; steps: string[] }[];
    tips?: string[];
  };
}

const manualSections: ManualSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    category: "Overview",
    content: {
      overview:
        "The Dashboard provides a real-time snapshot of your organization's loan management status including key metrics, charts, and quick action shortcuts.",
      features: [
        "Total active loans and outstanding balances",
        "Pending applications count",
        "Monthly disbursement and collection summaries",
        "Overdue loan alerts",
        "Quick navigation to common tasks",
      ],
      howTo: [
        {
          title: "View Dashboard",
          steps: [
            "Log in to the system",
            "The Dashboard is the default landing page",
            "Review summary cards at the top for key metrics",
            "Scroll down for charts and recent activity",
          ],
        },
      ],
      tips: [
        "Dashboard data refreshes automatically when you navigate to it",
        "Click on any stat card to navigate directly to that module",
      ],
    },
  },
  {
    id: "employees",
    title: "Employees",
    icon: <Users className="w-4 h-4" />,
    category: "People",
    content: {
      overview:
        "Manage all employee records including personal information, salary details, department assignments, and employment status. Employees are the core entities for loan applications.",
      features: [
        "Add, edit, and delete employee records",
        "Search and filter by name, department, branch, or status",
        "Bulk import employees via CSV/Excel",
        "View employee loan history and savings balance",
        "Manage employment status (Active, On Leave, Terminated)",
      ],
      howTo: [
        {
          title: "Add a New Employee",
          steps: [
            "Navigate to Employees from the sidebar",
            "Click the 'Add Employee' button",
            "Fill in required fields: Full Name, Employee ID, Department, Position, Date of Employment",
            "Set monthly salary and allowances",
            "Click 'Save' to create the employee record",
          ],
        },
        {
          title: "Import Employees in Bulk",
          steps: [
            "Click the 'Import CSV' button (requires Import permission)",
            "Download the template file for correct column format",
            "Fill in your employee data in the template",
            "Upload the completed file",
            "Review and confirm the import",
          ],
        },
        {
          title: "Edit an Employee",
          steps: [
            "Find the employee in the list using search or filters",
            "Click on the employee row to open details",
            "Click the 'Edit' button",
            "Make your changes and click 'Save'",
          ],
        },
      ],
      tips: [
        "Employee ID must be unique across the system",
        "Terminated employees cannot apply for new loans",
        "Salary information is used for loan eligibility calculations",
      ],
    },
  },
  {
    id: "loan-types",
    title: "Loan Types",
    icon: <FileText className="w-4 h-4" />,
    category: "Configuration",
    content: {
      overview:
        "Define and manage different loan products offered by your organization. Each loan type has its own interest rate, limits, eligibility criteria, and required documents.",
      features: [
        "Create custom loan types with specific parameters",
        "Set interest rates, minimum/maximum amounts, and repayment periods",
        "Define required documents for each loan type",
        "Configure savings-based loan eligibility",
        "Set approval levels and maximum active loans",
      ],
      howTo: [
        {
          title: "Create a New Loan Type",
          steps: [
            "Navigate to Loan Types from the sidebar",
            "Click 'Add Loan Type'",
            "Enter the loan name and description",
            "Set interest rate, min/max amounts, and max repayment period",
            "Configure eligibility criteria (minimum employment months, salary multiplier)",
            "Add required documents if needed",
            "Click 'Save'",
          ],
        },
      ],
      tips: [
        "Savings-based loans use the savings multiplier from Settings to calculate max eligible amount",
        "Interest-free loans will have 0% interest applied automatically",
        "Deactivated loan types won't appear in new application forms",
      ],
    },
  },
  {
    id: "applications",
    title: "Loan Applications",
    icon: <FileText className="w-4 h-4" />,
    category: "Loans",
    content: {
      overview:
        "Create, track, and manage loan applications throughout their lifecycle — from draft to disbursement. Each application goes through configurable approval workflows.",
      features: [
        "Create new loan applications for employees",
        "Track application status (Draft → Submitted → Under Review → Approved → Disbursed)",
        "Assign guarantors to applications",
        "Upload supporting documents",
        "View detailed application timeline",
        "Edit or delete applications in Draft/Submitted status",
        "Print loan application documents",
      ],
      howTo: [
        {
          title: "Create a Loan Application",
          steps: [
            "Navigate to Applications from the sidebar",
            "Click 'New Application'",
            "Select the employee and loan type",
            "Enter the requested amount and repayment period",
            "Add purpose and any remarks",
            "Assign at least 2 guarantors",
            "Upload required documents",
            "Click 'Submit' or save as 'Draft'",
          ],
        },
        {
          title: "Print an Application",
          steps: [
            "Open the application details by clicking on a row",
            "Click the 'Print' button (requires Print permission)",
            "Review the generated document",
            "Use your browser's print dialog to print or save as PDF",
          ],
        },
      ],
      tips: [
        "Applications can only be edited in Draft or Submitted status",
        "All guarantors must approve before the loan is auto-approved",
        "The application number is generated automatically (e.g., LA-2026-001)",
      ],
    },
  },
  {
    id: "approvals",
    title: "Approvals",
    icon: <CheckSquare className="w-4 h-4" />,
    category: "Loans",
    content: {
      overview:
        "Review and approve or reject pending loan applications. Managers and authorized personnel can set approved amounts, add remarks, and process applications.",
      features: [
        "View all pending applications awaiting approval",
        "Approve with custom approved amount",
        "Reject with reason/remarks",
        "View applicant details and loan history",
      ],
      howTo: [
        {
          title: "Approve a Loan Application",
          steps: [
            "Navigate to Approvals from the sidebar",
            "Review the list of pending applications",
            "Click on an application to view details",
            "Set the approved amount (can differ from requested)",
            "Add approval remarks if needed",
            "Click 'Approve'",
          ],
        },
      ],
    },
  },
  {
    id: "guarantee-approvals",
    title: "Guarantee Approvals",
    icon: <ShieldCheck className="w-4 h-4" />,
    category: "Loans",
    content: {
      overview:
        "Guarantors can review and approve or reject guarantee requests assigned to them. When all guarantors approve, the loan application is automatically approved.",
      features: [
        "View guarantee requests assigned to you",
        "Approve or reject guarantee requests",
        "See borrower details and loan information",
        "Automatic loan approval when all guarantors accept",
      ],
      howTo: [
        {
          title: "Respond to a Guarantee Request",
          steps: [
            "Navigate to Guarantee Approvals from the sidebar",
            "Review pending guarantee requests",
            "Click on a request to view loan details",
            "Click 'Approve' to accept or 'Reject' to decline",
          ],
        },
      ],
      tips: [
        "You'll receive a notification when assigned as a guarantor",
        "A loan requires at least 2 approved guarantors to proceed",
      ],
    },
  },
  {
    id: "disbursements",
    title: "Disbursements",
    icon: <Banknote className="w-4 h-4" />,
    category: "Loans",
    content: {
      overview:
        "Process approved loan disbursements. Record the disbursement method, date, and generate repayment schedules automatically.",
      features: [
        "View approved loans ready for disbursement",
        "Record disbursement details (method, voucher number)",
        "Auto-generate repayment schedule upon disbursement",
        "Track disbursement history",
      ],
      howTo: [
        {
          title: "Disburse a Loan",
          steps: [
            "Navigate to Disbursements from the sidebar",
            "Find the approved application",
            "Click 'Disburse'",
            "Select disbursement method (Bank Transfer, Check, Cash)",
            "Enter voucher number if applicable",
            "Confirm disbursement — this generates the repayment schedule",
          ],
        },
      ],
      tips: [
        "Disbursement cannot be reversed once confirmed",
        "The repayment schedule starts from the proposed start date",
      ],
    },
  },
  {
    id: "repayments",
    title: "Repayment Schedule",
    icon: <CalendarCheck className="w-4 h-4" />,
    category: "Payments",
    content: {
      overview:
        "View and manage repayment schedules for all disbursed loans. Track installment payments, due dates, and remaining balances.",
      features: [
        "View installment-by-installment breakdown",
        "Track paid vs. pending installments",
        "See principal and interest portions",
        "Monitor remaining balances",
      ],
      howTo: [
        {
          title: "View Repayment Schedule",
          steps: [
            "Navigate to Repayment Schedule from the sidebar",
            "Select a loan application to view its schedule",
            "Review each installment: due date, amount, principal, interest",
            "Green rows indicate paid installments",
          ],
        },
      ],
    },
  },
  {
    id: "payroll-deductions",
    title: "Payroll Deductions",
    icon: <Receipt className="w-4 h-4" />,
    category: "Payments",
    content: {
      overview:
        "Generate and manage monthly payroll deduction lists for active loans. Export deduction data for payroll processing.",
      features: [
        "Generate deduction lists by payroll period",
        "View deduction amounts per employee",
        "Process and mark deductions as completed",
        "Export deduction reports",
      ],
      howTo: [
        {
          title: "Process Payroll Deductions",
          steps: [
            "Navigate to Payroll Deductions from the sidebar",
            "Select the payroll period (month/year)",
            "Review the generated deduction list",
            "Click 'Process' to mark deductions as completed",
            "Export the list for payroll integration",
          ],
        },
      ],
    },
  },
  {
    id: "manual-payments",
    title: "Manual Payments",
    icon: <HandCoins className="w-4 h-4" />,
    category: "Payments",
    content: {
      overview:
        "Record manual loan repayments made outside of payroll (e.g., cash payments, bank transfers). Issue receipts for recorded payments.",
      features: [
        "Record cash, check, or bank transfer payments",
        "Auto-generate receipt numbers",
        "Apply payment to outstanding installments",
        "Print payment receipts",
      ],
      howTo: [
        {
          title: "Record a Manual Payment",
          steps: [
            "Navigate to Manual Payments from the sidebar",
            "Click 'Record Payment'",
            "Select the loan application",
            "Enter payment amount, date, and method",
            "Add receipt number and remarks",
            "Click 'Save' — the repayment schedule updates automatically",
          ],
        },
      ],
    },
  },
  {
    id: "overdue",
    title: "Overdue Tracking",
    icon: <AlertTriangle className="w-4 h-4" />,
    category: "Payments",
    content: {
      overview:
        "Monitor and manage overdue loan installments. Identify delinquent accounts and take appropriate follow-up actions.",
      features: [
        "View all overdue installments with days past due",
        "Filter by severity (30, 60, 90+ days)",
        "See borrower contact information for follow-up",
        "Track penalty amounts",
      ],
      howTo: [
        {
          title: "Review Overdue Loans",
          steps: [
            "Navigate to Overdue Tracking from the sidebar",
            "Review the list sorted by days overdue",
            "Use filters to focus on specific severity levels",
            "Click on a record to see full loan details",
          ],
        },
      ],
    },
  },
  {
    id: "savings",
    title: "Savings",
    icon: <PiggyBank className="w-4 h-4" />,
    category: "People",
    content: {
      overview:
        "Manage employee savings accounts including deposits, withdrawals, and balance tracking. Savings balances are used for savings-based loan eligibility.",
      features: [
        "Record deposits and withdrawals",
        "View savings balance per employee",
        "Bulk import savings transactions via CSV",
        "Track voluntary and mandatory savings",
        "Print savings receipts",
      ],
      howTo: [
        {
          title: "Record a Savings Transaction",
          steps: [
            "Navigate to Savings from the sidebar",
            "Click 'Add Transaction'",
            "Select the employee",
            "Choose transaction type (Deposit/Withdrawal)",
            "Enter amount, date, and payment method",
            "Click 'Save'",
          ],
        },
        {
          title: "Import Savings in Bulk",
          steps: [
            "Click the 'Import CSV' button (requires Import permission)",
            "Download and fill the template",
            "Upload the completed file",
            "Review and confirm the import",
          ],
        },
      ],
      tips: [
        "Savings balance directly affects eligibility for savings-based loans",
        "The savings multiplier in Settings determines maximum borrowable amount",
      ],
    },
  },
  {
    id: "guarantee-deactivation",
    title: "Guarantee Deactivation",
    icon: <ShieldOff className="w-4 h-4" />,
    category: "Loans",
    content: {
      overview:
        "Deactivate guarantees for loans that have been fully repaid or closed. Generate deactivation certificates for guarantors.",
      features: [
        "View guarantees eligible for deactivation",
        "Process guarantee deactivation",
        "Generate and print deactivation certificates",
      ],
      howTo: [
        {
          title: "Deactivate a Guarantee",
          steps: [
            "Navigate to Guarantee Deactivation from the sidebar",
            "Find the loan with completed repayment",
            "Click 'Deactivate' on the guarantee record",
            "Print the deactivation certificate for the guarantor",
          ],
        },
      ],
    },
  },
  {
    id: "reports",
    title: "Reports",
    icon: <BarChart3 className="w-4 h-4" />,
    category: "Analytics",
    content: {
      overview:
        "Generate various reports for management decision-making, regulatory compliance, and internal auditing.",
      features: [
        "Loan portfolio summary reports",
        "Disbursement and collection reports",
        "Overdue/delinquency reports",
        "Employee savings reports",
        "Export reports to Excel",
      ],
      howTo: [
        {
          title: "Generate a Report",
          steps: [
            "Navigate to Reports from the sidebar",
            "Select the report type",
            "Set date range and filters",
            "Click 'Generate'",
            "Export to Excel if needed (requires Export permission)",
          ],
        },
      ],
    },
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="w-4 h-4" />,
    category: "Administration",
    content: {
      overview:
        "Configure system-wide settings including company information, loan parameters, email notifications, and data backup/restore.",
      features: [
        "Company details and branding (logo, stamp)",
        "Loan configuration (interest rates, salary ratios, cutoff days)",
        "Email/SMTP settings for notifications",
        "Data backup and restore (Excel export/import)",
        "Security settings (password management)",
      ],
      howTo: [
        {
          title: "Update Company Settings",
          steps: [
            "Navigate to Settings from the sidebar",
            "Select the appropriate tab (Company, Loan, Email, etc.)",
            "Make your changes",
            "Click 'Save' to apply",
          ],
        },
        {
          title: "Upload Company Logo",
          steps: [
            "Go to Settings → Company Details tab",
            "Click on the logo upload area",
            "Select a PNG or JPG file (max 2MB)",
            "The logo will appear on printed documents",
          ],
        },
      ],
    },
  },
  {
    id: "permissions",
    title: "Permissions",
    icon: <Shield className="w-4 h-4" />,
    category: "Administration",
    content: {
      overview:
        "Manage role-based access control for all system modules. Define what each role (Admin, Manager, Finance User, Employee User) can do in every module.",
      features: [
        "Granular permission matrix per role",
        "8 permission types: View, Create, Edit, Delete, Import, Export, Print, Share",
        "16 modules covered",
        "Changes take effect immediately",
      ],
      howTo: [
        {
          title: "Manage Permissions",
          steps: [
            "Navigate to Permissions from the sidebar",
            "Select the role tab (Admin, Manager, Finance User, Employee User)",
            "Toggle checkboxes for each module and permission type",
            "Changes are saved automatically",
          ],
        },
      ],
      tips: [
        "Admin role typically has all permissions enabled",
        "Be cautious when removing View permission — it hides the module from the sidebar",
        "Import and Export permissions control bulk data operations",
        "Print permission controls document generation and printing features",
      ],
    },
  },
];

const categories = ["Overview", "People", "Loans", "Payments", "Analytics", "Configuration", "Administration"];

export default function UserManual() {
  const [search, setSearch] = useState("");

  const filtered = manualSections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.overview.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = categories
    .map((cat) => ({
      category: cat,
      sections: filtered.filter((s) => s.category === cat),
    }))
    .filter((g) => g.sections.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2.5">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Manual</h3>
          <p className="text-sm text-muted-foreground">
            Complete guide to using the Loan Management System
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search manual... (e.g. 'loan application', 'import', 'permission')"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Reference */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">⚡</span> Quick Reference — Permission Icons
        </h4>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Import</span>
          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Export</span>
          <span className="flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> Print</span>
          <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Buttons for these actions are only visible if your role has the corresponding permission enabled in the Permissions module.
        </p>
      </div>

      {/* Sections */}
      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="space-y-6 pr-3">
          {grouped.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {group.category}
              </h4>
              <Accordion type="multiple" className="space-y-2">
                {group.sections.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border border-border rounded-lg px-4 bg-card/50"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{section.icon}</div>
                        <span className="font-medium text-sm">{section.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {section.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-4">
                      {/* Overview */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {section.content.overview}
                      </p>

                      {/* Features */}
                      <div>
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                          Key Features
                        </h5>
                        <ul className="space-y-1">
                          {section.content.features.map((f, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* How-to Guides */}
                      {section.content.howTo.map((guide, gi) => (
                        <div key={gi} className="rounded-lg border border-border bg-secondary/20 p-3">
                          <h5 className="text-xs font-semibold text-foreground mb-2">
                            📋 {guide.title}
                          </h5>
                          <ol className="space-y-1">
                            {guide.steps.map((step, si) => (
                              <li key={si} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary font-semibold text-xs mt-0.5 min-w-[16px]">
                                  {si + 1}.
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}

                      {/* Tips */}
                      {section.content.tips && section.content.tips.length > 0 && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                          <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                            💡 Tips
                          </h5>
                          <ul className="space-y-1">
                            {section.content.tips.map((tip, ti) => (
                              <li key={ti} className="text-sm text-amber-800 dark:text-amber-300/80 flex items-start gap-2">
                                <span className="mt-0.5">→</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No matching sections found for "{search}"</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
