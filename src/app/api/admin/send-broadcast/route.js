import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "fs";
import path from "path";
import { generateUnsubscribeUrl } from "../../../../../lib/email";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const DELAY_MS = 250;

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("email_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("subscribed", true);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch subscriber count", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { subject, vars, templateHtml, audience, customEmail } = await request.json();

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!vars || !vars.event_name || !vars.event_name.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Use provided template HTML, or fall back to reading from disk
    let template;
    if (templateHtml && templateHtml.trim()) {
      template = templateHtml;
    } else {
      const templatePath = path.join(process.cwd(), "scripts", "templates", "promo.html");
      try {
        template = readFileSync(templatePath, "utf-8");
      } catch (err) {
        return NextResponse.json(
          { error: "Failed to read email template", details: err.message },
          { status: 500 }
        );
      }
    }

    // Replace all template variables
    for (const [key, value] of Object.entries(vars)) {
      template = template.replaceAll(`{{ ${key} }}`, value || "");
    }

    // Build recipient list based on audience
    let recipients;

    if (audience === "custom") {
      if (!customEmail || !customEmail.trim()) {
        return NextResponse.json(
          { error: "Custom email address is required" },
          { status: 400 }
        );
      }
      recipients = [{ email: customEmail.trim(), name: null }];
    } else {
      const { data: subscribers, error: subError } = await supabaseAdmin
        .from("email_subscribers")
        .select("email, name")
        .eq("subscribed", true);

      if (subError) {
        return NextResponse.json(
          { error: "Failed to fetch subscribers", details: subError.message },
          { status: 500 }
        );
      }

      if (!subscribers || subscribers.length === 0) {
        return NextResponse.json(
          { error: "No active subscribers found" },
          { status: 400 }
        );
      }

      recipients = subscribers;
    }

    // Send to each recipient
    let sent = 0;
    let failed = 0;

    for (const sub of recipients) {
      const unsubscribeUrl = generateUnsubscribeUrl(sub.email);

      const html = template
        .replaceAll("{{ unsubscribe_url }}", unsubscribeUrl);

      try {
        const { error: sendError } = await resend.emails.send({
          from: "Cicada Collective <noreply@mucicada.com>",
          to: [sub.email],
          subject,
          html,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
          },
        });

        if (sendError) {
          console.error(`FAILED ${sub.email}: ${sendError.message}`);
          failed++;
        } else {
          sent++;
        }
      } catch (err) {
        console.error(`ERROR ${sub.email}: ${err.message}`);
        failed++;
      }

      // Rate-limit delay between sends (skip for single recipient)
      if (recipients.length > 1 && DELAY_MS > 0) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    return NextResponse.json({
      sent,
      failed,
      total: recipients.length,
    });
  } catch (error) {
    console.error("Error in send-broadcast:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
