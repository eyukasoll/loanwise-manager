import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_import: boolean;
  can_export: boolean;
  can_print: boolean;
  can_share: boolean;
}

const roleMap: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  finance: "Finance User",
  employee: "Employee User",
};

export function usePermissions() {
  const { role } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const dbRole = roleMap[role] || role;

    supabase
      .from("role_permissions")
      .select("module, can_view, can_create, can_edit, can_delete")
      .eq("role", dbRole)
      .then(({ data }) => {
        setPermissions((data as ModulePermission[]) ?? []);
        setLoading(false);
      });
  }, [role]);

  const canView = (module: string) =>
    permissions.find((p) => p.module === module)?.can_view ?? false;

  const canCreate = (module: string) =>
    permissions.find((p) => p.module === module)?.can_create ?? false;

  const canEdit = (module: string) =>
    permissions.find((p) => p.module === module)?.can_edit ?? false;

  const canDelete = (module: string) =>
    permissions.find((p) => p.module === module)?.can_delete ?? false;

  return { permissions, loading, canView, canCreate, canEdit, canDelete };
}
