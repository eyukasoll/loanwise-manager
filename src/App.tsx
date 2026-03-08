import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import LoanTypes from "./pages/LoanTypes";
import Applications from "./pages/Applications";
import Approvals from "./pages/Approvals";
import Disbursements from "./pages/Disbursements";
import Repayments from "./pages/Repayments";
import PayrollDeductions from "./pages/PayrollDeductions";
import ManualPayments from "./pages/ManualPayments";
import OverdueTracking from "./pages/OverdueTracking";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import Permissions from "./pages/Permissions";
import Savings from "./pages/Savings";
import Login from "./pages/Login";
import GuaranteeDeactivation from "./pages/GuaranteeDeactivation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const guard = (module: string, el: React.ReactNode) => (
  <PermissionGuard module={module}>{el}</PermissionGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={guard("Dashboard", <Dashboard />)} />
              <Route path="/employees" element={guard("Employees", <Employees />)} />
              <Route path="/loan-types" element={guard("Loan Types", <LoanTypes />)} />
              <Route path="/applications" element={guard("Applications", <Applications />)} />
              <Route path="/approvals" element={guard("Approvals", <Approvals />)} />
              <Route path="/disbursements" element={guard("Disbursements", <Disbursements />)} />
              <Route path="/repayments" element={guard("Repayment Schedule", <Repayments />)} />
              <Route path="/deductions" element={guard("Payroll Deductions", <PayrollDeductions />)} />
              <Route path="/manual-payments" element={guard("Manual Payments", <ManualPayments />)} />
              <Route path="/overdue" element={guard("Overdue Tracking", <OverdueTracking />)} />
              <Route path="/reports" element={guard("Reports", <Reports />)} />
              <Route path="/settings" element={guard("Settings", <SettingsPage />)} />
              <Route path="/permissions" element={guard("Permissions", <Permissions />)} />
              <Route path="/savings" element={guard("Savings", <Savings />)} />
              <Route path="/guarantee-deactivation" element={guard("Applications", <GuaranteeDeactivation />)} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
