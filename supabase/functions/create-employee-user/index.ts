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
      .select("company_name, smtp_email, email_sender_name")
      .limit(1)
      .single();

    let emailSent = false;

    // Use Gmail API with OAuth2 refresh token
    const gmailClientId = Deno.env.get("GMAIL_CLIENT_ID");
    const gmailClientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
    const gmailRefreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");
    const senderEmail = settings?.smtp_email || "";
    const senderName = settings?.email_sender_name || settings?.company_name || "System";
    const companyName = settings?.company_name || "Our Platform";

    if (gmailClientId && gmailClientSecret && gmailRefreshToken && senderEmail) {
      try {
        // Step 1: Get access token from refresh token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: gmailClientId,
            client_secret: gmailClientSecret,
            refresh_token: gmailRefreshToken,
            grant_type: "refresh_token",
          }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          throw new Error("Failed to get access token: " + JSON.stringify(tokenData));
        }

        // Step 2: Build MIME message
        const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
    <h1 style="color: #059669; margin-bottom: 8px; font-size: 22px;">Welcome to ${companyName}!</h1>
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
      This is an automated message from ${companyName}. Please do not reply to this email.
    </p>
  </div>
</body>
</html>`;

        const mimeMessage = [
          `From: ${senderName} <${senderEmail}>`,
          `To: ${email}`,
          `Subject: Welcome to ${companyName} - Your Account Credentials`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=utf-8`,
          ``,
          htmlBody,
        ].join("\r\n");

        // Base64url encode the message
        const raw = btoa(unescape(encodeURIComponent(mimeMessage)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        // Step 3: Send via Gmail API
        const sendRes = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw }),
          }
        );

        const sendResult = await sendRes.json();
        if (sendRes.ok && sendResult.id) {
          emailSent = true;
        } else {
          console.error("Gmail API send failed:", sendResult);
        }
      } catch (emailError: any) {
        console.error("Gmail API error:", emailError);
      }
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
