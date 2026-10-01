const TEST_SERVER_ORIGIN = "http://127.0.0.1:8787";
const TEST_URL_PATTERN = "http://127.0.0.1/*";
const TEST_COOKIE_PREFIX = "gfm_test_";
const RECENT_CLEAR_MS = 10000;

const recentClears = new Map();

function cookieUrl(cookie) {
  return `${TEST_SERVER_ORIGIN}${cookie.path}`;
}

function shouldSkipRepeatedClear(details) {
  const key = `${details.tabId}:${details.url}`;
  const lastClear = recentClears.get(key);

  if (lastClear && Date.now() - lastClear < RECENT_CLEAR_MS) {
    console.info("Skipping repeated clear for", details.url);
    return true;
  }

  recentClears.set(key, Date.now());
  return false;
}

async function clearFakeTestCookies() {
  const cookies = await chrome.cookies.getAll({
    url: `${TEST_SERVER_ORIGIN}/`
  });

  const cookiesToRemove = cookies.filter((cookie) => cookie.name.startsWith(TEST_COOKIE_PREFIX));

  await Promise.all(cookiesToRemove.map((cookie) => {
    console.info("Removing cookie", cookie.name, cookie.domain, cookie.path);

    return chrome.cookies.remove({
      url: cookieUrl(cookie),
      name: cookie.name,
      storeId: cookie.storeId
    });
  }));

  return cookiesToRemove.length;
}

async function handleCompletedRequest(details) {
  console.info("Saw response", details.statusCode, details.url);

  if (details.type !== "main_frame") return;
  if (details.statusCode !== 400) return;
  if (details.tabId < 0) return;
  if (shouldSkipRepeatedClear(details)) return;

  console.info("Saw fake 400 page. Clearing fake local test cookies only.");

  const removedCount = await clearFakeTestCookies();

  console.info(`Removed ${removedCount} fake test cookie(s). Reloading tab.`);
  await chrome.tabs.reload(details.tabId);
}

chrome.webRequest.onCompleted.addListener((details) => {
  handleCompletedRequest(details).catch((error) => {
    console.error("Failed to clear fake local test cookies after 400 response:", error);
  });
}, {
  urls: [TEST_URL_PATTERN],
  types: ["main_frame"]
});
