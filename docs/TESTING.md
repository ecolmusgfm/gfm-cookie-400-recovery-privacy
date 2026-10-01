# Testing GFM Cookie 400 Recovery

Run commands from the repository root. Chrome is required for extension testing; Node.js is required for the local test server.

## Local Harness

This harness uses a separate extension and fake `gfm_test_*` cookies on `127.0.0.1`. It demonstrates cookie cleanup and tab reload without using GoFundMe cookies. It does not validate the production extension's GoFundMe allowlist or 431 handling.

1. On macOS, open a separate Chrome profile:

   ```sh
   open -na "Google Chrome" --args --user-data-dir=/tmp/gfm-cookie-test --no-first-run
   ```

2. Start the local server and leave it running:

   ```sh
   node testing/server/server.mjs
   ```

3. In the separate Chrome window, open `chrome://extensions`, enable **Developer mode**, and use **Load unpacked** to load `testing/local-extension/`.
4. Open `http://127.0.0.1:8787/seed`. The server creates 40 fake cookies, each containing 300 characters.
5. Click **Go to fake 400 page**. The server returns HTTP 400 when the Cookie header exceeds 2,048 characters. The test extension should remove the fake cookies and reload the page.
6. Confirm the final page says **OK**. In DevTools, use **Application > Storage > Cookies > http://127.0.0.1:8787** to confirm the `gfm_test_*` cookies are gone.
7. Stop the server with Ctrl+C when finished.

To inspect logs, open the local extension's **service worker** link on `chrome://extensions`. Expected messages include:

```text
Saw fake 400 page. Clearing fake local test cookies only.
Removed 40 fake test cookie(s). Reloading tab.
```

If the page stays on HTTP 400, confirm that the local test extension is enabled, reload it on `chrome://extensions`, and repeat from `/seed`.

## Production Build

Use the `extension/` folder for these tests. The production extension removes only the exact names listed in [the release notes](../extension/RELEASE_NOTES.md). It does not remove `gfm_test_*` or `gfm_400_test_*` cookies. The older development snippets are not part of this release.

### Load And Inspect

1. Open `chrome://extensions` and enable **Developer mode**.
2. Load the repository's `extension/` folder with **Load unpacked**.
3. Open its **service worker** link and select the Console tab.
4. Confirm there are no extension errors. Avoid enabling both an installed Web Store copy and an unpacked copy during the same test, since both could react to the same response.

### Healthy Helpdesk Page

1. Open `https://helpdesk.gofundme.com/` and sign in as needed.
2. Navigate between healthy Helpdesk pages.
3. Confirm there is no recovery message, cookie cleanup, or extension-triggered reload.

The production build does not log every healthy response.

### HTTP 400 Or 431 Recovery

Use an account or browser profile where the Helpdesk error can already be reproduced. Recovery may sign the user out of GoFundMe or related services.

1. Keep the extension service worker Console open.
2. Navigate to the affected Helpdesk URL.
3. Confirm the response is HTTP 400 or 431.
4. If allowlisted GoFundMe cookies are present, confirm they are removed and the tab reloads.
5. Confirm Helpdesk loads successfully or prompts for sign-in.

Expected logs for HTTP 400 are:

```text
Saw 400 response on Helpdesk. Clearing selected GoFundMe cookies only.
Removed N selected GoFundMe cookie(s). Reloading Helpdesk tab.
```

For HTTP 431, the first message uses `431` instead. The extension counts successful removals before deciding whether to reload.

### Scope And No-Match Checks

- Confirm visits to other GoFundMe sites do not trigger recovery. Only top-level Helpdesk requests are observed.
- Compare cookie names before and after a reproducible recovery. Only the nine allowlisted names on GoFundMe domains should disappear.
- If no allowlisted cookie is successfully removed, confirm this message appears and the extension does not reload the tab:

  ```text
  No selected GoFundMe cookies were removed. Not reloading the tab.
  ```

- Repeated errors for the same tab and URL within ten seconds should produce `Skipping repeated cookie clear for Helpdesk tab.` while the service worker retains its in-memory state.

If an error persists after cleanup, investigate the remaining Helpdesk response and cookie header. This extension only addresses errors caused by the listed cookies.
