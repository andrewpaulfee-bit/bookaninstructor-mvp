import fs from "node:fs";

const WP_BASE_URL = process.env.WP_BASE_URL || "https://bookaninstructor.com";
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const WP_PAGE_ID = process.env.WP_PAGE_ID || "15";
const HTML_FILE =
  process.env.HTML_FILE || "wordpress/bookaninstructor-homepage-custom-html.html";

if (!WP_USERNAME || !WP_APP_PASSWORD) {
  console.error(
    "Missing WP_USERNAME or WP_APP_PASSWORD. Use a WordPress application password, not your normal login password."
  );
  process.exit(1);
}

const rawHtml = fs.readFileSync(HTML_FILE, "utf8");

const content = `<!-- wp:html -->\n${rawHtml}\n<!-- /wp:html -->`;
const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
  "base64"
);

const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/pages/${WP_PAGE_ID}`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Home",
    content,
    status: "publish",
  }),
});

const body = await response.json().catch(() => null);

if (!response.ok) {
  console.error("WordPress publish failed.");
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      id: body.id,
      link: body.link,
      modified: body.modified,
    },
    null,
    2
  )
);
