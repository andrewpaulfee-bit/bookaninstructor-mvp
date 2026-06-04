import fs from "node:fs";

const WP_BASE_URL = process.env.WP_BASE_URL || "https://bookaninstructor.com";
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const WP_LOGIN_PASSWORD = process.env.WP_LOGIN_PASSWORD;
const WP_PAGE_ID = process.env.WP_PAGE_ID || "15";
const HTML_FILE =
  process.env.HTML_FILE || "wordpress/bookaninstructor-homepage-custom-html.html";

if (!WP_USERNAME || (!WP_APP_PASSWORD && !WP_LOGIN_PASSWORD)) {
  console.error(
    "Missing WordPress credentials. Set WP_USERNAME and either WP_APP_PASSWORD or WP_LOGIN_PASSWORD."
  );
  process.exit(1);
}

const rawHtml = fs.readFileSync(HTML_FILE, "utf8");

const content = `<!-- wp:html -->\n${rawHtml}\n<!-- /wp:html -->`;

async function publishWithHeaders(headers) {
  return fetch(`${WP_BASE_URL}/wp-json/wp/v2/pages/${WP_PAGE_ID}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
      ...headers,
  },
  body: JSON.stringify({
    title: "Home",
    content,
    status: "publish",
  }),
});
}

async function publishWithApplicationPassword() {
  const credentials = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString(
    "base64"
  );
  return publishWithHeaders({ Authorization: `Basic ${credentials}` });
}

function mergeSetCookie(existing, response) {
  const setCookie = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get("set-cookie")
      ? [response.headers.get("set-cookie")]
      : [];
  const jar = new Map(existing);
  for (const cookie of setCookie) {
    const first = cookie.split(";")[0];
    const eq = first.indexOf("=");
    if (eq > -1) jar.set(first.slice(0, eq), first.slice(eq + 1));
  }
  return jar;
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

async function publishWithLoginPassword() {
  let cookies = new Map();
  const loginUrl = `${WP_BASE_URL}/wp-login.php`;
  const loginPage = await fetch(loginUrl);
  cookies = mergeSetCookie(cookies, loginPage);
  const loginHtml = await loginPage.text();

  const challenge = loginHtml.match(
    /<label[^>]*for="jetpack_protect_answer"[^>]*>\s*(\d+)\s*&nbsp;\s*\+\s*&nbsp;\s*(\d+)\s*&nbsp;\s*=\s*&nbsp;/i
  );
  const challengeToken = loginHtml.match(
    /name="jetpack_protect_answer"\s+value="([^"]+)"/i
  )?.[1];

  const loginBody = new URLSearchParams({
    log: WP_USERNAME,
    pwd: WP_LOGIN_PASSWORD,
    "wp-submit": "Log In",
    redirect_to: `${WP_BASE_URL}/wp-admin/`,
    testcookie: "1",
  });

  if (challenge && challengeToken) {
    loginBody.set(
      "jetpack_protect_num",
      String(Number(challenge[1]) + Number(challenge[2]))
    );
    loginBody.set("jetpack_protect_answer", challengeToken);
  }

  const loginResponse = await fetch(loginUrl, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(cookies),
    },
    body: loginBody.toString(),
  });
  cookies = mergeSetCookie(cookies, loginResponse);

  const editResponse = await fetch(
    `${WP_BASE_URL}/wp-admin/post.php?post=${WP_PAGE_ID}&action=edit`,
    {
      headers: { Cookie: cookieHeader(cookies) },
    }
  );
  const editHtml = await editResponse.text();

  const nonce =
    editHtml.match(/"nonce":"([^"]+)"/)?.[1] ||
    editHtml.match(/wpApiSettings\s*=\s*[^;]*"nonce":"([^"]+)"/)?.[1] ||
    editHtml.match(/wp-api-fetch[^<]+nonceMiddleware[^<]+nonce":"([^"]+)"/)?.[1];

  if (!nonce) {
    throw new Error(
      "Could not find a WordPress REST nonce after login. Check that the user can edit the homepage."
    );
  }

  return publishWithHeaders({
    Cookie: cookieHeader(cookies),
    "X-WP-Nonce": nonce,
  });
}

let response;
if (WP_APP_PASSWORD) {
  response = await publishWithApplicationPassword();
}

if ((!response || !response.ok) && WP_LOGIN_PASSWORD) {
  response = await publishWithLoginPassword();
}

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
