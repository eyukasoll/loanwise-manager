export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  branch: string;
  dateOfEmployment: string;
  status: string;
  monthlySalary: number;
  bankAccount: string;
  phone: string;
  email: string;
  activeLoans: number;
  outstandingBalance: number;
}

export interface LoanTypeDocument {
  id: string;
  name: string;
  file: File | null;
  required: boolean;
}

export interface LoanType {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  maxPeriod: number;
  interestRate: number;
  interestFree: boolean;
  maxActiveLoans: number;
  deductionMethod: string;
  description?: string;
  eligibilityMinMonths?: number;
  salaryMultiplier?: number;
  approvalLevel?: string;
  requiredDocuments?: LoanTypeDocument[];
}

export interface LoanApplication {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  loanType: string;
  requestedAmount: number;
  approvedAmount: number | null;
  interestRate: number;
  repaymentPeriod: number;
  monthlyInstallment: number | null;
  purpose: string;
  status: "Draft" | "Submitted" | "Under Review" | "Pending Approval" | "Approved" | "Rejected" | "Disbursed" | "Active" | "Overdue" | "Closed" | "Cancelled";
  disbursementDate: string | null;
  totalPayable: number | null;
  totalPaid: number;
  outstandingBalance: number | null;
  nextDueDate: string | null;
}

export interface RepaymentScheduleItem {
  installmentNo: number;
  dueDate: string;
  beginningBalance: number;
  monthlyInstallment: number;
  principalPortion: number;
  interestPortion: number;
  totalDue: number;
  paidAmount: number;
  remainingBalance: number;
  status: "Paid" | "Pending" | "Overdue";
}
