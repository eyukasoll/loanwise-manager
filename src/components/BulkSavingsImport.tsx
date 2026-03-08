import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { fmt } from "@/lib/currency";

interface ParsedSaving {
  employee_id_text: string;
  savings_type: string;
  transaction_type: string;
  amount: number;
  payment_method: string;
  receipt_number: string;
  remarks: string;
}

interface RowResult {
  row: number;
  data: ParsedSaving;
  errors: string[];
  valid: boolean;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s\-]+/g, "_");
}

function validateRow(row: Record<string, any>, index: number, employeeIds: Set<string>): RowResult {
  const errors: string[] = [];
  const empId = String(row.employee_id || "").trim();
  if (!empId) errors.push("Employee ID is required");
  else if (!employeeIds.has(empId)) errors.push(`Employee ID '${empId}' not found`);

  const amount = Number(row.amount) || 0;
  if (amount <= 0) errors.push("Amount must be > 0");

  const savingsType = String(row.savings_type || "Voluntary").trim();
  if (!["Voluntary", "Mandatory"].includes(savingsType)) errors.push("Savings type must be Voluntary or Mandatory");

  const txType = String(row.transaction_type || "Deposit").trim();
  if (!["Deposit", "Withdrawal"].includes(txType)) errors.push("Transaction type must be Deposit or Withdrawal");

  const method = String(row.payment_method || "Cash").trim();

  return {
    row: index + 1,
    data: {
      employee_id_text: empId,
      savings_type: savingsType,
      transaction_type: txType,
      amount,
      payment_method: method,
      receipt_number: String(row.receipt_number || "").trim(),
      remarks: String(row.remarks || "").trim(),
    },
    errors,
    valid: errors.length === 0,
  };
}

interface BulkSavingsImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: ParsedSaving[]) => Promise<void>;
  employeeIds: Set<string>;
}

export default function BulkSavingsImport({ open, onOpenChange, onImport, employeeIds }: BulkSavingsImportProps) {
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
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

        if (json.length === 0) { toast.error("No data rows found"); return; }

        const normalized = json.map(row => {
          const out: Record<string, any> = {};
          for (const [key, val] of Object.entries(row)) out[normalizeHeader(key)] = val;
          return out;
        });

        setResults(normalized.map((row, i) => validateRow(row, i, employeeIds)));
      } catch {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [employeeIds]);

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
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["employee_id", "savings_type", "transaction_type", "amount", "payment_method", "receipt_number", "remarks"],
      ["EMP001", "Voluntary", "Deposit", 5000, "Cash", "REC-001", "Monthly saving"],
      ["EMP002", "Mandatory", "Deposit", 3000, "Bank Transfer", "REC-002", ""],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Savings");
    XLSX.writeFile(wb, "savings_import_template.xlsx");
  };

  const reset = () => { setResults([]); setFileName(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader><DialogTitle>Bulk Import Savings</DialogTitle></DialogHeader>

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
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
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
              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> {validCount} valid</span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-4 h-4" /> {invalidCount} errors</span>
              )}
            </div>
            <ScrollArea className="h-[340px] border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary/60 z-10">
                  <tr>
                    {["Row", "Employee ID", "Type", "Txn", "Amount", "Method", "Status"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 ${r.valid ? "" : "bg-destructive/5"}`}>
                      <td className="px-3 py-2">{r.row}</td>
                      <td className="px-3 py-2 font-mono">{r.data.employee_id_text}</td>
                      <td className="px-3 py-2">{r.data.savings_type}</td>
                      <td className="px-3 py-2">{r.data.transaction_type}</td>
                      <td className="px-3 py-2 font-bold">{fmt(r.data.amount)}</td>
                      <td className="px-3 py-2">{r.data.payment_method}</td>
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
              {importing ? "Importing..." : `Import ${validCount} Transaction${validCount !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
