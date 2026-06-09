import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const csvPath = process.argv[2];
const shouldWriteSql = process.argv.includes("--sql");

if (!csvPath) {
  console.error("Usage: node scripts/import-instructors-from-wordpress.mjs /path/to/users.csv [--sql]");
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function clean(value) {
  return String(value || "")
    .replace(/^'+/, "")
    .trim();
}

function normalizeCountry(value) {
  const country = clean(value).toUpperCase();
  if (!country || country === "AU") return "Australia";
  if (country === "NZ") return "New Zealand";
  return clean(value);
}

const text = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(text);
const headers = rows[0];
const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));

function cell(row, header) {
  return clean(row[indexByHeader[header]]);
}

const importRows = rows
  .slice(1)
  .map((row) => {
    const firstName = cell(row, "first_name") || cell(row, "billing_first_name");
    const lastName = cell(row, "last_name") || cell(row, "billing_last_name");
    const displayName = cell(row, "display_name");
    const email = cell(row, "user_email");
    const name = displayName || [firstName, lastName].filter(Boolean).join(" ");
    const city = cell(row, "billing_city");
    const state = cell(row, "billing_state");
    const country = normalizeCountry(cell(row, "billing_country"));
    const location = [city, state].filter(Boolean).join(", ");

    return {
      first_name: firstName || null,
      last_name: lastName || null,
      name,
      email,
      location: location || null,
      country,
      categories: [],
      bio: cell(row, "description") || null,
      hourly_rate: null,
      mobile: cell(row, "hp_mobile") || cell(row, "billing_phone") || null,
      service_areas: [],
      registered_for_gst: false,
      terms_accepted: false,
      approved: false,
    };
  })
  .filter((row) => row.email && row.name);

const seen = new Set();
const uniqueRows = importRows.filter((row) => {
  const email = row.email.toLowerCase();
  if (seen.has(email)) return false;
  seen.add(email);
  return true;
});

const { data: existing, error: selectError } = await supabase
  .from("instructors")
  .select("email");

if (selectError) {
  throw selectError;
}

const existingEmails = new Set((existing || []).map((row) => row.email.toLowerCase()));
const rowsToInsert = uniqueRows.filter((row) => !existingEmails.has(row.email.toLowerCase()));
const legacyRowsToInsert = rowsToInsert.map((row) => ({
  name: row.name,
  email: row.email,
  location: row.location,
  categories: row.categories,
  bio: row.bio,
  hourly_rate: row.hourly_rate,
  approved: row.approved,
}));

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  if (!values?.length) return "'{}'::text[]";
  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

if (shouldWriteSql) {
  const outputPath = path.join(process.cwd(), "supabase", "import-instructors.sql");
  const statements = legacyRowsToInsert.map((row) => {
    return [
      "insert into public.instructors",
      "  (name, email, location, categories, bio, hourly_rate, approved)",
      "select",
      `  ${sqlString(row.name)},`,
      `  ${sqlString(row.email)},`,
      `  ${sqlString(row.location)},`,
      `  ${sqlArray(row.categories)},`,
      `  ${sqlString(row.bio)},`,
      "  null,",
      "  false",
      `where not exists (select 1 from public.instructors where lower(email) = lower(${sqlString(row.email)}));`,
    ].join("\n");
  });

  fs.writeFileSync(
    outputPath,
    [
      "-- Generated from WordPress user export.",
      "-- Run this in Supabase SQL Editor to import instructor profiles.",
      "",
      ...statements,
      "",
    ].join("\n")
  );

  console.log(`Wrote ${legacyRowsToInsert.length} import statements to ${outputPath}`);
  process.exit(0);
}

console.log(`Parsed ${rows.length - 1} users.`);
console.log(`Prepared ${uniqueRows.length} unique instructor profiles.`);
console.log(`Skipping ${uniqueRows.length - rowsToInsert.length} already in Supabase.`);

if (rowsToInsert.length === 0) {
  console.log("Nothing to import.");
  process.exit(0);
}

let { error: insertError } = await supabase.from("instructors").insert(rowsToInsert);

if (insertError?.code === "PGRST204") {
  console.log("Live table is missing newer profile columns; retrying with core fields only.");
  const legacyResult = await supabase.from("instructors").insert(legacyRowsToInsert);
  insertError = legacyResult.error;
}

if (insertError) {
  throw insertError;
}

console.log(`Imported ${rowsToInsert.length} instructor profiles.`);
