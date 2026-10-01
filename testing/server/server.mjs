import http from "node:http";

const HOST = "127.0.0.1";
const PORT = 8787;
const COOKIE_COUNT = 40;
const COOKIE_SIZE = 300;
const MAX_COOKIE_HEADER_SIZE = 2048;

function html(title, body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 48px;
        max-width: 760px;
        line-height: 1.5;
      }

      code {
        background: #f2f2f2;
        padding: 2px 5px;
      }

      a {
        display: inline-block;
        margin-top: 16px;
      }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

function seedCookies(res) {
  const cookies = Array.from({ length: COOKIE_COUNT }, (_, index) => {
    return `gfm_test_${index}=${"x".repeat(COOKIE_SIZE)}; Path=/; Max-Age=3600; SameSite=Lax`;
  });

  res.setHeader("Set-Cookie", cookies);
}

const server = http.createServer((req, res) => {
  const cookieHeader = req.headers.cookie || "";

  if (req.url === "/seed") {
    seedCookies(res);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html("Seeded Test Cookies", `
      <h1>Fake test cookies have been created</h1>
      <p>This page created cookies named <code>gfm_test_*</code> on <code>127.0.0.1</code>.</p>
      <p>Next, open the home page. It should trigger a fake <code>400</code> error.</p>
      <a href="/">Go to fake 400 page</a>
    `));
    return;
  }

  if (cookieHeader.length > MAX_COOKIE_HEADER_SIZE) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html("400 Bad Request", `
      <h1>400 Bad Request</h1>
      <p>The fake Cookie header is too large.</p>
      <p>Current Cookie header size: <code>${cookieHeader.length}</code> bytes.</p>
      <p>If the test extension is loaded, it should clear the fake cookies and reload this page.</p>
    `));
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html("OK", `
    <h1>OK</h1>
    <p>The page loaded successfully.</p>
    <p>Current Cookie header size: <code>${cookieHeader.length}</code> bytes.</p>
    <p><a href="/seed">Create fake oversized cookies again</a></p>
  `));
});

server.listen(PORT, HOST, () => {
  console.log(`Fake 400 test server running at http://${HOST}:${PORT}`);
  console.log(`Open http://${HOST}:${PORT}/seed to create fake oversized cookies.`);
});
