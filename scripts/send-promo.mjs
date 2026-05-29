import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import crypto from "crypto";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getFlag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const subject = getFlag("--subject");
const dryRun = args.includes("--dry-run");

if (!subject) {
  console.error("Usage: node --env-file=.env.local scripts/send-promo.mjs --subject \"Subject Line\" [--dry-run]");
  process.exit(1);
}

// ── Environment checks ───────────────────────────────────────────────────────
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  console.error("Run with: node --env-file=.env.local scripts/send-promo.mjs --subject \"...\"");
  process.exit(1);
}

if (!dryRun && !process.env.RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable.");
  process.exit(1);
}

// ── Setup ─────────────────────────────────────────────────────────────────────
const supabaseUrl = "https://towexkhijugmytktakxd.supabase.co";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = dryRun ? null : new Resend(process.env.RESEND_API_KEY);

// ── Load template ─────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, "templates", "promo.html");
let template;
try {
  template = readFileSync(templatePath, "utf-8");
} catch (err) {
  console.error(`Failed to read template at ${templatePath}:`, err.message);
  process.exit(1);
}

// ── Unsubscribe URL (same logic as lib/email.js:generateUnsubscribeUrl) ──────
function generateUnsubscribeUrl(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = crypto.createHmac("sha256", secret).update(email).digest("hex");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mucicada.com";
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

// ── Fetch subscribers ─────────────────────────────────────────────────────────
const { data: subscribers, error } = await supabase
  .from("email_subscribers")
  .select("email, name")
  .eq("subscribed", true);

if (error) {
  console.error("Error querying email_subscribers:", error.message);
  process.exit(1);
}

if (!subscribers.length) {
  console.log("No active subscribers found. Nothing to send.");
  process.exit(0);
}

console.log(`Found ${subscribers.length} subscriber(s). Subject: "${subject}"`);
if (dryRun) console.log("── DRY RUN (no emails will be sent) ──\n");

// ── Send loop ─────────────────────────────────────────────────────────────────
let sent = 0;
let failed = 0;
const DELAY_MS = 250; // small delay between sends to respect rate limits

for (const sub of subscribers) {
  const name = sub.name || "there";
  const unsubscribeUrl = generateUnsubscribeUrl(sub.email);

  const html = template
    .replaceAll("{{name}}", name)
    .replaceAll("{{unsubscribe_url}}", unsubscribeUrl)
    .replaceAll("{{subject}}", subject);

  if (dryRun) {
    console.log(`  To: ${sub.email} (${name})`);
    console.log(`  Unsubscribe: ${unsubscribeUrl}\n`);
    sent++;
    continue;
  }

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
      console.error(`  FAILED ${sub.email}: ${sendError.message}`);
      failed++;
    } else {
      console.log(`  Sent: ${sub.email}`);
      sent++;
    }
  } catch (err) {
    console.error(`  ERROR ${sub.email}: ${err.message}`);
    failed++;
  }

  // Rate-limit delay
  if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nDone. ${sent} sent, ${failed} failed out of ${subscribers.length} subscriber(s).`);
if (dryRun) console.log("(Dry run — no emails were actually sent.)");
