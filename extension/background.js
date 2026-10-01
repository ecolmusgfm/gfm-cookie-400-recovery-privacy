const TARGET_COOKIE_NAMES = new Set([
  "DSR",
  "DTD",
  "passport2",
  "trident_idToken",
  "trident_accessToken",
  "trident_refreshToken",
  "frs_idToken",
  "frs_accessToken",
  "frs_refreshToken"
]);

const HELP_DESK_URL_PATTERN = "https://helpdesk.gofundme.com/*";
const GOFUNDME_COOKIE_DOMAIN = "gofundme.com";
const RECENT_CLEAR_MS = 10000;
const RECOVERABLE_STATUS_CODES = new Set([400, 431]);

const recentClears = new Map();

function isGofundmeCookie(cookie) {
  const domain = cookie.domain.replace(/^\./, "");
  return domain === GOFUNDME_COOKIE_DOMAIN || domain.endsWith(`.${GOFUNDME_COOKIE_DOMAIN}`);
}

function cookieUrl(cookie) {
  const domain = cookie.domain.replace(/^\./, "");
  const protocol = cookie.secure ? "https" : "http";
  return `${protocol}://${domain}${cookie.path}`;
}

function cookieRemoveDetails(cookie) {
  const details = {
    url: cookieUrl(cookie),
    name: cookie.name,
    storeId: cookie.storeId
  };

  if (cookie.partitionKey) {
    details.partitionKey = cookie.partitionKey;
  }

  return details;
}

function shouldSkipRepeatedClear(details) {
  const key = `${details.tabId}:${details.url}`;
  const lastClear = recentClears.get(key);

  if (lastClear && Date.now() - lastClear < RECENT_CLEAR_MS) {
    console.info("Skipping repeated cookie clear for Helpdesk tab.");
    return true;
  }

  recentClears.set(key, Date.now());
  return false;
}

async function clearSelectedGofundmeCookies() {
  const cookies = await chrome.cookies.getAll({
    domain: GOFUNDME_COOKIE_DOMAIN
  });

  const cookiesToRemove = cookies
    .filter(isGofundmeCookie)
    .filter((cookie) => TARGET_COOKIE_NAMES.has(cookie.name));

  const results = await Promise.all(cookiesToRemove.map((cookie) => {
    return chrome.cookies.remove(cookieRemoveDetails(cookie));
  }));

  return results.filter(Boolean).length;
}

async function handleCompletedRequest(details) {
  if (details.type !== "main_frame") return;
  if (!RECOVERABLE_STATUS_CODES.has(details.statusCode)) return;
  if (details.tabId < 0) return;
  if (shouldSkipRepeatedClear(details)) return;

  console.info(`Saw ${details.statusCode} response on Helpdesk. Clearing selected GoFundMe cookies only.`);

  const removedCount = await clearSelectedGofundmeCookies();

  if (removedCount === 0) {
    console.info("No selected GoFundMe cookies were removed. Not reloading the tab.");
    return;
  }

  console.info(`Removed ${removedCount} selected GoFundMe cookie(s). Reloading Helpdesk tab.`);
  await chrome.tabs.reload(details.tabId);
}

chrome.webRequest.onCompleted.addListener((details) => {
  handleCompletedRequest(details).catch((error) => {
    console.error("Failed to clear selected GoFundMe cookies after Helpdesk error response:", error);
  });
}, {
  urls: [HELP_DESK_URL_PATTERN],
  types: ["main_frame"]
});
