import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useEffect } from "react";

export interface Notification {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { data: currentEmployee } = useCurrentEmployee();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", currentEmployee?.id],
    queryFn: async () => {
      if (!currentEmployee?.id) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("employee_id", currentEmployee.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!currentEmployee?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!currentEmployee?.id) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if ((payload.new as any).employee_id === currentEmployee.id) {
            queryClient.invalidateQueries({ queryKey: ["notifications", currentEmployee.id] });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentEmployee?.id, queryClient]);

  const unreadCount = (query.data || []).filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", currentEmployee?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!currentEmployee?.id) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("employee_id", currentEmployee.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", currentEmployee?.id] });
    },
  });

  return { notifications: query.data || [], unreadCount, isLoading: query.isLoading, markAsRead, markAllAsRead };
}
