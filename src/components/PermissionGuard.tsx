import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface Props {
  module: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ module, children }: Props) {
  const { canView, loading } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!canView(module)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
