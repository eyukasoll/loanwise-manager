import React, { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Shield, Eye, Plus, Edit, Trash2, Download, Upload, Printer, Share2 } from "lucide-react";

const ROLES = ["Admin", "Manager", "Finance User", "Employee User"];

const MODULES = [
  "Dashboard", "Employees", "Loan Types", "Applications", "Approvals",
  "Disbursements", "Repayment Schedule", "Payroll Deductions", "Manual Payments",
  "Overdue Tracking", "Reports", "Settings", "Permissions",
];

const ACTIONS = [
  { key: "can_view", label: "View", icon: Eye, color: "text-info" },
  { key: "can_create", label: "Create", icon: Plus, color: "text-success" },
  { key: "can_edit", label: "Edit", icon: Edit, color: "text-warning" },
  { key: "can_delete", label: "Delete", icon: Trash2, color: "text-destructive" },
] as const;

type PermRow = {
  id: string;
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export default function Permissions() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<PermRow[]>([]);
  const [activeRole, setActiveRole] = useState(ROLES[0]);
  const { canEdit: permCanEdit } = usePermissions();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .order("module");
    if (data) setPermissions(data as PermRow[]);
    setLoading(false);
  };

  const getPerm = (role: string, module: string) =>
    permissions.find((p) => p.role === role && p.module === module);

  const togglePerm = (role: string, module: string, action: keyof Pick<PermRow, "can_view" | "can_create" | "can_edit" | "can_delete">) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.role === role && p.module === module
          ? { ...p, [action]: !p[action] }
          : p
      )
    );
  };

  const toggleAllForModule = (role: string, module: string, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.role === role && p.module === module
          ? { ...p, can_view: checked, can_create: checked, can_edit: checked, can_delete: checked }
          : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const rolePerms = permissions.filter((p) => p.role === activeRole);

    let hasError = false;
    for (const perm of rolePerms) {
      const { error } = await supabase
        .from("role_permissions")
        .update({
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
        })
        .eq("id", perm.id);
      if (error) hasError = true;
    }

    if (hasError) {
      toast({ title: "Error", description: "Failed to save some permissions.", variant: "destructive" });
    } else {
      toast({ title: "Permissions saved", description: `${activeRole} permissions updated successfully.` });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <TopBar title={t.permTitle} subtitle={t.permSubtitle} />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title={t.permTitle} subtitle={t.permSubtitle} />
      <div className="p-3 sm:p-6 animate-fade-in">
        <Tabs value={activeRole} onValueChange={setActiveRole} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-card border border-border">
              {ROLES.map((role) => (
                <TabsTrigger key={role} value={role} className="gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  {role}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button onClick={handleSave} disabled={saving || !permCanEdit("Permissions")}>
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Permissions"}
            </Button>
          </div>

          {ROLES.map((role) => (
            <TabsContent key={role} value={role}>
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs w-56">Module</th>
                        <th className="text-center px-3 py-3 font-medium text-muted-foreground text-xs w-20">All</th>
                        {ACTIONS.map((a) => (
                          <th key={a.key} className="text-center px-3 py-3 font-medium text-muted-foreground text-xs w-20">
                            <div className="flex items-center justify-center gap-1.5">
                              <a.icon className={`w-3.5 h-3.5 ${a.color}`} />
                              {a.label}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((module) => {
                        const perm = getPerm(role, module);
                        if (!perm) return null;
                        const allChecked = perm.can_view && perm.can_create && perm.can_edit && perm.can_delete;
                        const someChecked = perm.can_view || perm.can_create || perm.can_edit || perm.can_delete;

                        return (
                          <tr key={module} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                            <td className="px-5 py-3 font-medium">{module}</td>
                            <td className="text-center px-3 py-3">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                                  onCheckedChange={(checked) => toggleAllForModule(role, module, !!checked)}
                                />
                              </div>
                            </td>
                            {ACTIONS.map((a) => (
                              <td key={a.key} className="text-center px-3 py-3">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={perm[a.key]}
                                    onCheckedChange={() => togglePerm(role, module, a.key)}
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-info" /> View — Can see the page and data</span>
                <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-success" /> Create — Can add new records</span>
                <span className="flex items-center gap-1.5"><Edit className="w-3.5 h-3.5 text-warning" /> Edit — Can modify existing records</span>
                <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-destructive" /> Delete — Can remove records</span>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
