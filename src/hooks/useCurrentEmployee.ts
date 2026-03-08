import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCurrentEmployee() {
  const { user } = useAuth();
  const email = user?.email;

  return useQuery({
    queryKey: ["current-employee", email],
    queryFn: async () => {
      if (!email) return null;
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!email,
  });
}
