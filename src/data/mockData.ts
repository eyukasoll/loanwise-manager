import { LoanApplication, Employee, LoanType, RepaymentScheduleItem } from "@/types/loan";

export const employees: Employee[] = [
  { id: "EMP001", name: "James Mwangi", department: "Engineering", position: "Senior Developer", branch: "Nairobi HQ", dateOfEmployment: "2019-03-15", status: "Active", monthlySalary: 150000, bankAccount: "KCB-1234567890", phone: "+254712345678", email: "james.mwangi@company.com", activeLoans: 1, outstandingBalance: 85000 },
  { id: "EMP002", name: "Sarah Ochieng", department: "Finance", position: "Accountant", branch: "Nairobi HQ", dateOfEmployment: "2020-07-01", status: "Active", monthlySalary: 120000, bankAccount: "EQT-9876543210", phone: "+254723456789", email: "sarah.ochieng@company.com", activeLoans: 0, outstandingBalance: 0 },
  { id: "EMP003", name: "Peter Kamau", department: "HR", position: "HR Officer", branch: "Mombasa", dateOfEmployment: "2018-01-10", status: "Active", monthlySalary: 110000, bankAccount: "COOP-1122334455", phone: "+254734567890", email: "peter.kamau@company.com", activeLoans: 1, outstandingBalance: 45000 },
  { id: "EMP004", name: "Grace Njeri", department: "Operations", position: "Operations Manager", branch: "Nairobi HQ", dateOfEmployment: "2017-05-20", status: "Active", monthlySalary: 180000, bankAccount: "KCB-5566778899", phone: "+254745678901", email: "grace.njeri@company.com", activeLoans: 0, outstandingBalance: 0 },
  { id: "EMP005", name: "David Odhiambo", department: "Sales", position: "Sales Executive", branch: "Kisumu", dateOfEmployment: "2021-02-14", status: "Active", monthlySalary: 95000, bankAccount: "NCBA-6677889900", phone: "+254756789012", email: "david.odhiambo@company.com", activeLoans: 1, outstandingBalance: 120000 },
  { id: "EMP006", name: "Mary Wanjiku", department: "Marketing", position: "Marketing Lead", branch: "Nairobi HQ", dateOfEmployment: "2019-11-03", status: "Active", monthlySalary: 135000, bankAccount: "ABSA-7788990011", phone: "+254767890123", email: "mary.wanjiku@company.com", activeLoans: 0, outstandingBalance: 0 },
  { id: "EMP007", name: "John Kiprop", department: "Engineering", position: "DevOps Engineer", branch: "Nairobi HQ", dateOfEmployment: "2020-09-18", status: "Active", monthlySalary: 145000, bankAccount: "STN-8899001122", phone: "+254778901234", email: "john.kiprop@company.com", activeLoans: 0, outstandingBalance: 0 },
  { id: "EMP008", name: "Fatuma Ali", department: "Legal", position: "Legal Counsel", branch: "Mombasa", dateOfEmployment: "2016-04-22", status: "Active", monthlySalary: 200000, bankAccount: "KCB-9900112233", phone: "+254789012345", email: "fatuma.ali@company.com", activeLoans: 1, outstandingBalance: 200000 },
];

export const loanTypes: LoanType[] = [
  { id: "LT001", name: "Personal Loan", minAmount: 10000, maxAmount: 500000, maxPeriod: 24, interestRate: 8, interestFree: false, maxActiveLoans: 1, deductionMethod: "Payroll" },
  { id: "LT002", name: "Emergency Loan", minAmount: 5000, maxAmount: 100000, maxPeriod: 6, interestRate: 0, interestFree: true, maxActiveLoans: 1, deductionMethod: "Payroll" },
  { id: "LT003", name: "Salary Advance", minAmount: 5000, maxAmount: 80000, maxPeriod: 3, interestRate: 0, interestFree: true, maxActiveLoans: 1, deductionMethod: "Payroll" },
  { id: "LT004", name: "Education Loan", minAmount: 20000, maxAmount: 300000, maxPeriod: 18, interestRate: 5, interestFree: false, maxActiveLoans: 1, deductionMethod: "Payroll" },
  { id: "LT005", name: "Medical Loan", minAmount: 10000, maxAmount: 250000, maxPeriod: 12, interestRate: 3, interestFree: false, maxActiveLoans: 2, deductionMethod: "Payroll" },
  { id: "LT006", name: "Welfare Loan", minAmount: 5000, maxAmount: 150000, maxPeriod: 12, interestRate: 0, interestFree: true, maxActiveLoans: 1, deductionMethod: "Manual" },
];

export const loanApplications: LoanApplication[] = [
  { id: "LA-2025-001", date: "2025-01-15", employeeId: "EMP001", employeeName: "James Mwangi", department: "Engineering", loanType: "Personal Loan", requestedAmount: 200000, approvedAmount: 200000, interestRate: 8, repaymentPeriod: 12, monthlyInstallment: 18000, purpose: "Home renovation", status: "Active", disbursementDate: "2025-01-20", totalPayable: 216000, totalPaid: 131000, outstandingBalance: 85000, nextDueDate: "2025-09-20" },
  { id: "LA-2025-002", date: "2025-02-10", employeeId: "EMP003", employeeName: "Peter Kamau", department: "HR", loanType: "Emergency Loan", requestedAmount: 50000, approvedAmount: 50000, interestRate: 0, repaymentPeriod: 6, monthlyInstallment: 8334, purpose: "Medical emergency", status: "Active", disbursementDate: "2025-02-12", totalPayable: 50000, totalPaid: 5000, outstandingBalance: 45000, nextDueDate: "2025-09-12" },
  { id: "LA-2025-003", date: "2025-03-01", employeeId: "EMP005", employeeName: "David Odhiambo", department: "Sales", loanType: "Personal Loan", requestedAmount: 150000, approvedAmount: 150000, interestRate: 8, repaymentPeriod: 12, monthlyInstallment: 13500, purpose: "Car purchase down payment", status: "Active", disbursementDate: "2025-03-05", totalPayable: 162000, totalPaid: 42000, outstandingBalance: 120000, nextDueDate: "2025-09-05" },
  { id: "LA-2025-004", date: "2025-04-20", employeeId: "EMP008", employeeName: "Fatuma Ali", department: "Legal", loanType: "Education Loan", requestedAmount: 250000, approvedAmount: 250000, interestRate: 5, repaymentPeriod: 18, monthlyInstallment: 15278, purpose: "MBA program fees", status: "Active", disbursementDate: "2025-04-25", totalPayable: 275000, totalPaid: 75000, outstandingBalance: 200000, nextDueDate: "2025-09-25" },
  { id: "LA-2025-005", date: "2025-06-15", employeeId: "EMP002", employeeName: "Sarah Ochieng", department: "Finance", loanType: "Salary Advance", requestedAmount: 60000, approvedAmount: 60000, interestRate: 0, repaymentPeriod: 3, monthlyInstallment: 20000, purpose: "Urgent personal needs", status: "Pending Approval", disbursementDate: null, totalPayable: 60000, totalPaid: 0, outstandingBalance: 60000, nextDueDate: null },
  { id: "LA-2025-006", date: "2025-07-01", employeeId: "EMP006", employeeName: "Mary Wanjiku", department: "Marketing", loanType: "Medical Loan", requestedAmount: 80000, approvedAmount: null, interestRate: 3, repaymentPeriod: 8, monthlyInstallment: null, purpose: "Dental surgery", status: "Under Review", disbursementDate: null, totalPayable: null, totalPaid: 0, outstandingBalance: null, nextDueDate: null },
  { id: "LA-2025-007", date: "2025-07-10", employeeId: "EMP004", employeeName: "Grace Njeri", department: "Operations", loanType: "Personal Loan", requestedAmount: 300000, approvedAmount: 300000, interestRate: 8, repaymentPeriod: 24, monthlyInstallment: 13500, purpose: "Land purchase", status: "Approved", disbursementDate: null, totalPayable: 324000, totalPaid: 0, outstandingBalance: 324000, nextDueDate: null },
  { id: "LA-2025-008", date: "2024-06-01", employeeId: "EMP007", employeeName: "John Kiprop", department: "Engineering", loanType: "Salary Advance", requestedAmount: 40000, approvedAmount: 40000, interestRate: 0, repaymentPeriod: 2, monthlyInstallment: 20000, purpose: "Rent deposit", status: "Closed", disbursementDate: "2024-06-05", totalPayable: 40000, totalPaid: 40000, outstandingBalance: 0, nextDueDate: null },
];

export const monthlyTrends = [
  { month: "Jan", disbursed: 200000, recovered: 95000 },
  { month: "Feb", disbursed: 50000, recovered: 110000 },
  { month: "Mar", disbursed: 150000, recovered: 125000 },
  { month: "Apr", disbursed: 250000, recovered: 140000 },
  { month: "May", disbursed: 0, recovered: 155000 },
  { month: "Jun", disbursed: 60000, recovered: 160000 },
  { month: "Jul", disbursed: 380000, recovered: 170000 },
];

export const loanTypeDistribution = [
  { name: "Personal", value: 3, amount: 650000 },
  { name: "Emergency", value: 1, amount: 50000 },
  { name: "Salary Adv.", value: 2, amount: 100000 },
  { name: "Education", value: 1, amount: 250000 },
  { name: "Medical", value: 1, amount: 80000 },
];

export const departmentDistribution = [
  { name: "Engineering", loans: 2, amount: 240000 },
  { name: "HR", loans: 1, amount: 50000 },
  { name: "Sales", loans: 1, amount: 150000 },
  { name: "Legal", loans: 1, amount: 250000 },
  { name: "Finance", loans: 1, amount: 60000 },
  { name: "Marketing", loans: 1, amount: 80000 },
  { name: "Operations", loans: 1, amount: 300000 },
];

export function generateRepaymentSchedule(loan: LoanApplication): RepaymentScheduleItem[] {
  if (!loan.disbursementDate || !loan.approvedAmount) return [];
  const items: RepaymentScheduleItem[] = [];
  const principal = loan.approvedAmount;
  const totalPayable = loan.totalPayable || principal;
  const months = loan.repaymentPeriod;
  const monthlyInstallment = loan.monthlyInstallment || Math.ceil(totalPayable / months);
  let balance = totalPayable;
  const startDate = new Date(loan.disbursementDate);

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const principalPortion = Math.ceil(principal / months);
    const interestPortion = monthlyInstallment - principalPortion;
    const paid = i <= Math.floor(loan.totalPaid / monthlyInstallment);
    const paidAmount = paid ? monthlyInstallment : (i === Math.floor(loan.totalPaid / monthlyInstallment) + 1 ? loan.totalPaid % monthlyInstallment : 0);
    balance = Math.max(0, balance - (paid ? monthlyInstallment : paidAmount));

    items.push({
      installmentNo: i,
      dueDate: dueDate.toISOString().split("T")[0],
      beginningBalance: balance + (paid ? monthlyInstallment : paidAmount),
      monthlyInstallment,
      principalPortion,
      interestPortion: Math.max(0, interestPortion),
      totalDue: monthlyInstallment,
      paidAmount: paid ? monthlyInstallment : paidAmount,
      remainingBalance: balance,
      status: paid ? "Paid" : (new Date() > dueDate ? "Overdue" : "Pending"),
    });
  }
  return items;
}
