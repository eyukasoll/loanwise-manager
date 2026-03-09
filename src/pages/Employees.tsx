import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import TablePagination, { usePagination } from "@/components/TablePagination";
import StatusBadge from "@/components/StatusBadge";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useNextEmployeeId, useBulkCreateEmployees, useGuaranteedEmployeeIds } from "@/hooks/useLoans";
import { usePermissions } from "@/hooks/usePermissions";
import { useLanguage } from "@/i18n/LanguageContext";
import { Search, Plus, Eye, Edit, Trash2, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, CURRENCY } from "@/lib/currency";
import BulkEmployeeImport from "@/components/BulkEmployeeImport";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const userTypes = [
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Finance User", label: "Finance User" },
  { value: "Employee User", label: "Employee User" },
];

const emptyForm = {
  employee_id: "", full_name: "", department: "", position: "", branch: "Main Office",
  date_of_employment: "", employment_status: "Active", monthly_salary: 0,
  allowances: 0, bank_account: "", phone: "", email: "", user_type: "Employee User",
  gender: "",
};

export default function Employees() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: guaranteedIds = new Set<string>() } = useGuaranteedEmployeeIds();
  const { data: nextId = "EMP001" } = useNextEmployeeId();
  const createMut = useCreateEmployee();
  const updateMut = useUpdateEmployee();
  const deleteMut = useDeleteEmployee();
  const bulkCreateMut = useBulkCreateEmployees();
  const { canCreate, canEdit, canDelete, canImport } = usePermissions();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [viewEmp, setViewEmp] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendCredentials = async (emp: any) => {
    if (!emp.email) {
      toast.error("This employee has no email address");
      return;
    }
    setResendingId(emp.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-employee-user", {
        body: { email: emp.email, full_name: emp.full_name, user_type: emp.user_type || "Employee User" },
      });
      if (error) {
        toast.error("Failed to resend credentials");
      } else if (data?.email_sent) {
        toast.success(`New credentials sent to ${emp.email}`);
      } else if (data?.success) {
        toast.info(`Password reset to: ${data.password} (email not sent — check SMTP settings)`);
      }
    } catch {
      toast.error("Failed to resend credentials");
    } finally {
      setResendingId(null);
    }
  };

  // Calculate next ID number for bulk import
  const nextIdNum = (() => {
    const last = nextId;
    return last ? parseInt(last.replace("EMP", ""), 10) : 1;
  })();

  const filtered = employees.filter((e: any) =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedItems, currentPage, pageSize, totalItems, startIndex, setCurrentPage, setPageSize } = usePagination(filtered);

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, employee_id: nextId }); setFormOpen(true); };
  const openEdit = (emp: any) => {
    setEditingId(emp.id);
    setForm({
      employee_id: emp.employee_id, full_name: emp.full_name, department: emp.department,
      position: emp.position, branch: emp.branch, date_of_employment: emp.date_of_employment,
      employment_status: emp.employment_status, monthly_salary: emp.monthly_salary,
      allowances: emp.allowances, bank_account: emp.bank_account || "",
      phone: emp.phone || "", email: emp.email || "",
      user_type: emp.user_type || "Employee User",
      gender: emp.gender || "",
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.employee_id || !form.full_name || !form.department || !form.position || !form.date_of_employment) return;
    if (editingId) {
      updateMut.mutate({ id: editingId, ...form }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMut.mutate(form, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMut.mutate(id);
    }
  };

  return (
    <div>
      <TopBar title={t.empTitle} subtitle={t.empSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchEmployees} className="h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-72" />
          </div>
          <div className="flex items-center gap-2">
              {canImport("Employees") && (
                <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}><Upload className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">{t.importCSV}</span></Button>
              )}
              {canCreate("Employees") && (
                <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">{t.addEmployee}</span></Button>
              )}
            </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading employees...</div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                  <tr className="border-b border-border bg-secondary/40">
                     <th className="text-left px-3 py-3 font-medium text-muted-foreground text-xs w-10">#</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.employeeId}</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.name}</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">Gender</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.department}</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.position}</th>
                     <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs">{t.salary}</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.status}</th>
                     <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs">{t.guarantee}</th>
                     <th className="text-center px-5 py-3 font-medium text-muted-foreground text-xs">{t.actions}</th>
                   </tr>
                 </thead>
                 <tbody>
                   {paginatedItems.map((emp: any, idx: number) => (
                     <tr key={emp.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                       <td className="px-3 py-3 text-muted-foreground text-xs">{startIndex + idx + 1}</td>
                        <td className="px-5 py-3 font-mono text-xs">{emp.employee_id}</td>
                        <td className="px-5 py-3 font-medium">{emp.full_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{emp.gender || "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{emp.department}</td>
                        <td className="px-5 py-3 text-muted-foreground">{emp.position}</td>
                       <td className="px-5 py-3 text-right">{fmt(emp.monthly_salary)}</td>
                       <td className="px-5 py-3"><StatusBadge status={emp.employment_status} /></td>
                       <td className="px-5 py-3">
                         {guaranteedIds.has(emp.id) ? (
                           <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{t.guaranteed}</span>
                         ) : (
                           <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">{t.free}</span>
                         )}
                       </td>
                       <td className="px-5 py-3 text-center flex items-center justify-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => setViewEmp(emp)}><Eye className="w-4 h-4" /></Button>
                         {canEdit("Employees") && <Button variant="ghost" size="icon" onClick={() => openEdit(emp)}><Edit className="w-4 h-4" /></Button>}
                         {canEdit("Employees") && emp.email && (
                           <Button variant="ghost" size="icon" title="Resend Credentials" onClick={() => handleResendCredentials(emp)} disabled={resendingId === emp.id}>
                             <RefreshCw className={`w-4 h-4 text-primary ${resendingId === emp.id ? "animate-spin" : ""}`} />
                           </Button>
                         )}
                         {canDelete("Employees") && <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                       </td>
                     </tr>
                   ))}
                   {filtered.length === 0 && (
                     <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">No employees found. Click "Add Employee" to get started.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
             <TablePagination currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
           </div>
         )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewEmp} onOpenChange={() => setViewEmp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t.employeeDetails}</DialogTitle></DialogHeader>
          {viewEmp && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([
                [t.employeeId, viewEmp.employee_id], [t.name, viewEmp.full_name],
                [t.department, viewEmp.department], [t.position, viewEmp.position],
                [t.branch, viewEmp.branch], [t.joined, viewEmp.date_of_employment],
                [t.salary, fmt(viewEmp.monthly_salary)], [t.allowances, fmt(viewEmp.allowances)],
                [t.status, viewEmp.employment_status], [t.phone, viewEmp.phone || "—"],
                [t.email, viewEmp.email || "—"], [t.bankAccount, viewEmp.bank_account || "—"],
                [t.userType, viewEmp.user_type || "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? t.editEmployee : t.addEmployee}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Employee ID</Label>
              <Input value={form.employee_id} readOnly disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <Label>Department <span className="text-destructive">*</span></Label>
              <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Engineering" className="mt-1" />
            </div>
            <div>
              <Label>Position <span className="text-destructive">*</span></Label>
              <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Software Engineer" className="mt-1" />
            </div>
            <div>
              <Label>Branch</Label>
              <Input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Date of Employment <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.date_of_employment} onChange={e => setForm(f => ({ ...f, date_of_employment: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Monthly Salary ({CURRENCY})</Label>
              <Input type="number" value={form.monthly_salary || ""} onChange={e => setForm(f => ({ ...f, monthly_salary: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <Label>Allowances ({CURRENCY})</Label>
              <Input type="number" value={form.allowances || ""} onChange={e => setForm(f => ({ ...f, allowances: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <Label>Employment Status</Label>
              <Select value={form.employment_status} onValueChange={v => setForm(f => ({ ...f, employment_status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bank Account</Label>
              <Input value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>User Type <span className="text-destructive">*</span></Label>
              <Select value={form.user_type} onValueChange={v => setForm(f => ({ ...f, user_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {userTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {editingId ? t.updateEmployee : t.createEmployee}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkEmployeeImport
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        nextIdNum={nextIdNum}
        onImport={async (employees) => {
          const withIds = employees.map((emp, i) => ({
            ...emp,
            employee_id: `EMP${String(nextIdNum + i).padStart(3, "0")}`,
          }));
          await bulkCreateMut.mutateAsync(withIds);
        }}
      />
    </div>
  );
}
