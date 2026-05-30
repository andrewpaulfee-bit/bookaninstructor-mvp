import fs from "node:fs";
import path from "node:path";

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/generate-contact-imports.mjs /path/to/contact.csv");
  process.exit(1);
}

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
  return String(value || "").trim();
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArrayFromCsv(value) {
  const values = clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) return "'{}'::text[]";
  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

function isInstructor(row) {
  return /instructor/i.test(
    [row.Lists, row.Tags, row.Role].filter(Boolean).join(" ")
  );
}

function isClient(row) {
  return /client/i.test([row.Lists, row.Tags, row.Role].filter(Boolean).join(" "));
}

const text = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(text);
const headers = rows[0];
const records = rows.slice(1).map((row) =>
  Object.fromEntries(headers.map((header, index) => [header, clean(row[index])]))
);

const seenInstructorEmails = new Set();
const instructors = records
  .filter((row) => row.Email && isInstructor(row))
  .filter((row) => {
    const email = row.Email.toLowerCase();
    if (seenInstructorEmails.has(email)) return false;
    seenInstructorEmails.add(email);
    return true;
  });

const seenClientEmails = new Set();
const clients = records
  .filter((row) => row.Email && isClient(row) && !isInstructor(row))
  .filter((row) => {
    const email = row.Email.toLowerCase();
    if (seenClientEmails.has(email)) return false;
    seenClientEmails.add(email);
    return true;
  });

const instructorSql = instructors.map((row) => {
  const name = [row["First Name"], row["Last Name"]].filter(Boolean).join(" ") || row.Username;
  const location = row.Location || row.City || null;

  return [
    "insert into public.instructors",
    "  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)",
    "select",
    `  ${sqlString(row["First Name"])},`,
    `  ${sqlString(row["Last Name"])},`,
    `  ${sqlString(name)},`,
    `  ${sqlString(row.Email)},`,
    `  ${sqlString(location)},`,
    `  ${sqlArrayFromCsv(row.Styles)},`,
    "  null,",
    `  ${sqlString(row.Phone)},`,
    `  ${sqlArrayFromCsv(row["Service Areas"])},`,
    `  ${sqlString(row["Head Shot"])},`,
    `  ${sqlString(row["Working with Children Card"])},`,
    `  ${sqlString(row["Card Expiry Date"])},`,
    "  false,",
    "  false",
    `where not exists (select 1 from public.instructors where lower(email) = lower(${sqlString(row.Email)}));`,
  ].join("\n");
});

const clientSql = clients.map((row) => {
  return [
    "insert into public.contacts",
    "  (first_name, last_name, email, phone, city, country, contact_type, lists, tags, role, client_name, source_user_id)",
    "select",
    `  ${sqlString(row["First Name"])},`,
    `  ${sqlString(row["Last Name"])},`,
    `  ${sqlString(row.Email)},`,
    `  ${sqlString(row.Phone)},`,
    `  ${sqlString(row.City || row.Location)},`,
    `  ${sqlString(row.Country)},`,
    `  ${sqlString(row["Contact Type"])},`,
    `  ${sqlString(row.Lists)},`,
    `  ${sqlString(row.Tags)},`,
    `  ${sqlString(row.Role)},`,
    `  ${sqlString(row["Client Name"])},`,
    `  ${sqlString(row["User ID"])}`,
    `where not exists (select 1 from public.contacts where lower(email) = lower(${sqlString(row.Email)}));`,
  ].join("\n");
});

const outputDir = path.join(process.cwd(), "supabase");

fs.writeFileSync(
  path.join(outputDir, "import-contact-instructors.sql"),
  [
    "-- Generated from contact CSV.",
    "-- Run instructor-signup-fields.sql first so newer instructor columns exist.",
    "",
    ...instructorSql,
    "",
  ].join("\n")
);

fs.writeFileSync(
  path.join(outputDir, "import-client-contacts.sql"),
  [
    "-- Generated from contact CSV.",
    "-- Run contacts-schema.sql first.",
    "",
    ...clientSql,
    "",
  ].join("\n")
);

console.log(`Prepared ${instructors.length} instructor imports.`);
console.log(`Prepared ${clients.length} client contact imports.`);

