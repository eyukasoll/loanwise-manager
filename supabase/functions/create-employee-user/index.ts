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

    // Get company SMTP settings
    const { data: settings } = await admin
      .from("company_settings")
      .select("company_name, smtp_host, smtp_port, smtp_email, smtp_password, email_sender_name")
      .limit(1)
      .single();

    let emailSent = false;

    if (settings?.smtp_host && settings?.smtp_email && settings?.smtp_password) {
      try {
        // Use Gmail API approach via SMTP relay with base64 encoding
        const smtpHost = settings.smtp_host;
        const smtpPort = 465; // Force SSL port for edge function compatibility
        const smtpUser = settings.smtp_email;
        const smtpPass = settings.smtp_password;
        const senderName = settings.email_sender_name || settings.company_name || "System";

        const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h1 style="color: #059669; margin-bottom: 8px; font-size: 22px;">Welcome to ${settings.company_name || "Our Platform"}!</h1>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
      Your employee account has been created. Use the credentials below to log in.
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Name:</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${full_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Email (Username):</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280; font-weight: 500;">Password:</td>
          <td style="padding: 6px 0; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 2px; font-size: 16px;">${password}</td>
        </tr>
      </table>
    </div>
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
      <p style="color: #92400e; font-size: 13px; margin: 0;">
        ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
      </p>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
      This is an automated message from ${settings.company_name || "the system"}. Please do not reply to this email.
    </p>
  </div>
</body>
</html>`;

        // Build raw MIME message
        const boundary = "----=_Part_" + crypto.randomUUID().replace(/-/g, "");
        const rawMessage = [
          `From: ${senderName} <${smtpUser}>`,
          `To: ${email}`,
          `Subject: Welcome to ${settings.company_name || "Our Platform"} - Your Account Credentials`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/plain; charset=utf-8`,
          ``,
          `Welcome ${full_name}! Your login credentials: Email: ${email}, Password: ${password}. Please change your password after first login.`,
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          htmlBody,
          ``,
          `--${boundary}--`,
        ].join("\r\n");

        // Connect via TLS to port 465
        const conn = await Deno.connectTls({ hostname: smtpHost, port: smtpPort });
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        async function readLine(): Promise<string> {
          const buf = new Uint8Array(4096);
          const n = await conn.read(buf);
          return n ? decoder.decode(buf.subarray(0, n)) : "";
        }

        async function send(cmd: string): Promise<string> {
          await conn.write(encoder.encode(cmd + "\r\n"));
          return await readLine();
        }

        // SMTP conversation
        await readLine(); // greeting
        await send(`EHLO localhost`);
        
        // AUTH LOGIN
        await send(`AUTH LOGIN`);
        await send(btoa(smtpUser));
        const authResult = await send(btoa(smtpPass));
        
        if (!authResult.startsWith("235")) {
          throw new Error("SMTP auth failed: " + authResult);
        }

        await send(`MAIL FROM:<${smtpUser}>`);
        await send(`RCPT TO:<${email}>`);
        await send(`DATA`);
        
        // Send message body (dot-stuffing)
        await conn.write(encoder.encode(rawMessage + "\r\n.\r\n"));
        const dataResult = await readLine();
        
        if (dataResult.startsWith("250")) {
          emailSent = true;
        }
        
        await send(`QUIT`);
        conn.close();
      } catch (smtpError: any) {
        console.error("SMTP send failed:", smtpError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser?.id,
        password,
        email_sent: emailSent,
        message: emailSent
          ? "User created and credentials sent via email"
          : "User created but email could not be sent. Please share credentials manually.",
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
