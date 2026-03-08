import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ParsedEmployee {
  full_name: string;
  department: string;
  position: string;
  branch: string;
  date_of_employment: string;
  employment_status: string;
  monthly_salary: number;
  allowances: number;
  bank_account: string;
  phone: string;
  email: string;
}

interface RowResult {
  row: number;
  data: ParsedEmployee;
  errors: string[];
  valid: boolean;
}

const EXPECTED_HEADERS = [
  "full_name", "department", "position", "branch", "date_of_employment",
  "employment_status", "monthly_salary", "allowances", "bank_account", "phone", "email"
];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s\-]+/g, "_");
}

function parseDate(val: any): string {
  if (!val) return "";
  if (typeof val === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  // Try ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return s;
}

function validateRow(row: Record<string, any>, index: number): RowResult {
  const errors: string[] = [];
  const full_name = String(row.full_name || "").trim();
  const department = String(row.department || "").trim();
  const position = String(row.position || "").trim();
  const date_of_employment = parseDate(row.date_of_employment);

  if (!full_name) errors.push("Full Name is required");
  if (full_name.length > 200) errors.push("Full Name too long");
  if (!department) errors.push("Department is required");
  if (!position) errors.push("Position is required");
  if (!date_of_employment || !/^\d{4}-\d{2}-\d{2}$/.test(date_of_employment))
    errors.push("Date of Employment must be a valid date (YYYY-MM-DD)");

  const monthly_salary = Number(row.monthly_salary) || 0;
  const allowances = Number(row.allowances) || 0;
  if (monthly_salary < 0) errors.push("Salary cannot be negative");

  const status = String(row.employment_status || "Active").trim();
  const validStatuses = ["Active", "Probation", "Contract", "Terminated", "Resigned"];
  const matchedStatus = validStatuses.find(s => s.toLowerCase() === status.toLowerCase()) || "Active";

  const email = String(row.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email format");

  return {
    row: index + 1,
    data: {
      full_name,
      department,
      position,
      branch: String(row.branch || "Main Office").trim(),
      date_of_employment,
      employment_status: matchedStatus,
      monthly_salary,
      allowances,
      bank_account: String(row.bank_account || "").trim(),
      phone: String(row.phone || "").trim(),
      email,
    },
    errors,
    valid: errors.length === 0,
  };
}

interface BulkEmployeeImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (employees: ParsedEmployee[]) => Promise<void>;
  nextIdNum: number;
}

export default function BulkEmployeeImport({ open, onOpenChange, onImport, nextIdNum }: BulkEmployeeImportProps) {
  const [results, setResults] = useState<RowResult[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

        if (json.length === 0) {
          toast.error("No data rows found in the file");
          return;
        }

        // Normalize headers
        const normalized = json.map(row => {
          const out: Record<string, any> = {};
          for (const [key, val] of Object.entries(row)) {
            out[normalizeHeader(key)] = val;
          }
          return out;
        });

        const parsed = normalized.map((row, i) => validateRow(row, i));
        setResults(parsed);
      } catch {
        toast.error("Failed to parse file. Please ensure it's a valid CSV or Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    const validRows = results.filter(r => r.valid);
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      await onImport(validRows.map(r => r.data));
      toast.success(`Successfully imported ${validRows.length} employees`);
      setResults([]);
      setFileName("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["full_name", "department", "position", "branch", "date_of_employment", "employment_status", "monthly_salary", "allowances", "bank_account", "phone", "email"],
      ["John Doe", "Engineering", "Software Engineer", "Main Office", "2024-01-15", "Active", 15000, 2000, "1234567890", "+251911000000", "john@example.com"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employee_import_template.xlsx");
  };

  const reset = () => { setResults([]); setFileName(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Employees</DialogTitle>
        </DialogHeader>

        {results.length === 0 ? (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Drop a CSV or Excel file here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-1" /> Download Template
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
                <span className="text-muted-foreground">({results.length} rows)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}><X className="w-4 h-4 mr-1" /> Clear</Button>
            </div>

            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" /> {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" /> {invalidCount} with errors
                </span>
              )}
            </div>

            <ScrollArea className="h-[340px] border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary/60 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Row</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Department</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Position</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 ${r.valid ? "" : "bg-destructive/5"}`}
                    >
                      <td className="px-3 py-2">{r.row}</td>
                      <td className="px-3 py-2 font-mono">EMP{String(nextIdNum + i).padStart(3, "0")}</td>
                      <td className="px-3 py-2 font-medium">{r.data.full_name}</td>
                      <td className="px-3 py-2">{r.data.department}</td>
                      <td className="px-3 py-2">{r.data.position}</td>
                      <td className="px-3 py-2">
                        {r.valid ? (
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Valid</span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1" title={r.errors.join(", ")}>
                            <AlertCircle className="w-3 h-3" /> {r.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          {results.length > 0 && (
            <Button onClick={handleImport} disabled={validCount === 0 || importing}>
              {importing ? "Importing..." : `Import ${validCount} Employee${validCount !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
