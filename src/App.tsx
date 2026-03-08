import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/loan-types" element={<LoanTypes />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/disbursements" element={<Disbursements />} />
              <Route path="/repayments" element={<Repayments />} />
              <Route path="/deductions" element={<PayrollDeductions />} />
              <Route path="/manual-payments" element={<ManualPayments />} />
              <Route path="/overdue" element={<OverdueTracking />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/permissions" element={<Permissions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
