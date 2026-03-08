import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "admin@loanmanager.app", password: "admin123", full_name: "System Admin", role: "admin" },
    { email: "manager@loanmanager.app", password: "manager123", full_name: "Loan Manager", role: "manager" },
    { email: "finance@loanmanager.app", password: "finance123", full_name: "Finance User", role: "finance" },
    { email: "employee@loanmanager.app", password: "employee123", full_name: "Employee User", role: "employee" },
  ];

  const results = [];

  for (const u of users) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });

      if (error) {
        results.push({ email: u.email, status: "error", message: error.message });
        continue;
      }

      // Update role from default 'employee' to the correct one
      if (data.user && u.role !== "employee") {
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .update({ role: u.role })
          .eq("user_id", data.user.id);
        if (roleErr) {
          results.push({ email: u.email, status: "created but role update failed", message: roleErr.message });
          continue;
        }
      }

      results.push({ email: u.email, status: "created", role: u.role });
    } catch (err) {
      results.push({ email: u.email, status: "exception", message: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
