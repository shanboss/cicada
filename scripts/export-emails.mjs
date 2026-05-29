import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const supabaseUrl = "https://towexkhijugmytktakxd.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  console.error("Run with: node --env-file=.env.local scripts/export-emails.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const { data, error } = await supabase
  .from("email_subscribers")
  .select("email")
  .eq("subscribed", true);

if (error) {
  console.error("Error querying email_subscribers:", error.message);
  process.exit(1);
}

const emails = data.map((row) => row.email).sort();

const csv = ["email", ...emails].join("\n");
const outputPath = "unique_emails.csv";
writeFileSync(outputPath, csv);

console.log(`Exported ${emails.length} subscribed emails to ${outputPath}`);
