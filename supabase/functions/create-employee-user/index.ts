import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, user_type } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Generate 8-digit password
    const password = generatePassword();

    // Map user_type to app_role
    const roleMap: Record<string, string> = {
      Admin: "admin",
      Manager: "manager",
      "Finance User": "finance",
      "Employee User": "employee",
    };
    const appRole = roleMap[user_type] || "employee";

    // Check if user already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let authUser: any;
    let isExisting = false;

    if (existingUser) {
      // User already exists — reuse and reset password
      const { data: updateData, error: updateError } = await admin.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: { full_name },
      });
      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUser = updateData.user;
      isExisting = true;
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUser = authData.user;
    }

    // Assign role (the trigger creates 'employee' by default, update if different)
    if (appRole !== "employee" && authUser) {
      await admin.from("user_roles").update({ role: appRole }).eq("user_id", authUser.id);
    }

    // Email sending skipped — password returned to UI for manual sharing

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser?.id,
        password,
        email_sent: false,
        message: "User created. Please share credentials manually.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
