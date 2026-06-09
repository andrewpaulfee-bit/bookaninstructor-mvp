import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const imageDir = process.argv[2];
const shouldApply = process.argv.includes("--apply");

if (!imageDir) {
  console.error("Usage: node scripts/import-instructor-headshots.mjs /path/to/headshots [--apply]");
  process.exit(1);
}

function readEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const entries = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    });

  return Object.fromEntries(entries);
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function variants(row) {
  const first = row.first_name || "";
  const last = row.last_name || "";
  const name = row.name || "";
  const lastInitial = last ? last.slice(0, 1) : "";

  return new Set(
    [
      name,
      first,
      `${first}${last}`,
      `${first}${lastInitial}`,
      `${first} ${last}`,
      `${first} ${lastInitial}`,
      name.replace(/\s+/g, ""),
    ]
      .map(normalize)
      .filter(Boolean)
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const env = readEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const imageFiles = fs
  .readdirSync(imageDir)
  .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
  .sort((a, b) => a.localeCompare(b));

const { data: instructors, error } = await supabase
  .from("instructors")
  .select("id,first_name,last_name,name,email,headshot_url")
  .order("name", { ascending: true });

if (error) {
  throw error;
}

const matches = imageFiles.map((file) => {
  const base = path.basename(file, path.extname(file));
  const key = normalize(base);
  const candidates = (instructors || []).filter((row) => variants(row).has(key));

  return {
    file,
    key,
    candidates,
    status: candidates.length === 1 ? "matched" : candidates.length > 1 ? "ambiguous" : "unmatched",
  };
});

const reportRows = [
  ["file", "status", "matched_name", "matched_email", "existing_headshot_url", "candidate_count"],
  ...matches.map((match) => {
    const candidate = match.candidates[0];
    return [
      match.file,
      match.status,
      candidate?.name || "",
      candidate?.email || "",
      candidate?.headshot_url || "",
      String(match.candidates.length),
    ];
  }),
];

const reportPath = "/private/tmp/bkin-headshot-match-report.csv";
fs.writeFileSync(reportPath, reportRows.map((row) => row.map(csvCell).join(",")).join("\n"));

const matched = matches.filter((match) => match.status === "matched");
const ambiguous = matches.filter((match) => match.status === "ambiguous");
const unmatched = matches.filter((match) => match.status === "unmatched");

console.log(`Images: ${imageFiles.length}`);
console.log(`Matched: ${matched.length}`);
console.log(`Ambiguous: ${ambiguous.length}`);
console.log(`Unmatched: ${unmatched.length}`);
console.log(`Report: ${reportPath}`);

if (unmatched.length) {
  console.log(`Unmatched files: ${unmatched.map((match) => match.file).join(", ")}`);
}

if (ambiguous.length) {
  console.log(`Ambiguous files: ${ambiguous.map((match) => match.file).join(", ")}`);
}

if (!shouldApply) {
  console.log("Dry run only. Re-run with --apply to upload matched images and update profiles.");
  process.exit(0);
}

for (const match of matched) {
  const filePath = path.join(imageDir, match.file);
  const ext = path.extname(match.file).toLowerCase();
  const mimeType =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "image/png";
  const instructor = match.candidates[0];
  const storagePath = `headshots/imported/${instructor.id}${ext}`;
  const fileBytes = fs.readFileSync(filePath);

  const { error: uploadError } = await supabase.storage
    .from("instructor-files")
    .upload(storagePath, fileBytes, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Could not upload ${match.file}: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("instructor-files").getPublicUrl(storagePath);
  const { error: updateError } = await supabase
    .from("instructors")
    .update({ headshot_url: data.publicUrl })
    .eq("id", instructor.id);

  if (updateError) {
    throw new Error(`Could not update ${instructor.name}: ${updateError.message}`);
  }

  console.log(`Updated ${instructor.name} <- ${match.file}`);
}

console.log(`Applied ${matched.length} headshot updates.`);
