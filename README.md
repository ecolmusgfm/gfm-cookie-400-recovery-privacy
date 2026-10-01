# GFM Cookie 400 Recovery

Source, release package, documentation, and privacy policy for the GFM Cookie 400 Recovery Chrome extension, version 1.0.0.

The extension restores access to `https://helpdesk.gofundme.com/` after a top-level page load returns HTTP 400 or 431. It removes only nine allowlisted GoFundMe cookies and reloads the tab if at least one cookie was removed. Recovery can sign the user out of related GoFundMe services.

The production manifest requests `cookies`, `webRequest`, and GoFundMe host permissions. It does not request the `tabs` permission. Processing stays in the browser; the extension does not send data or load remote code.

## Documentation

- [Release notes and cookie allowlist](extension/RELEASE_NOTES.md)
- [Local and production testing](docs/TESTING.md)
- [Packaging, Web Store updates, and rollback](docs/MAINTENANCE.md)
- [Privacy policy](PRIVACY_POLICY.md)

## Build Files

- [Production extension](extension/): manifest, service worker, icon, and release notes copied from the prepared v1.0.0 release build.
- [v1.0.0 upload ZIP](releases/gfm-cookie-400-recovery-1.0.0.zip): the original no-tabs upload package, preserved byte for byte.
- [Local test extension](testing/local-extension/): a separate development extension that removes fake cookies on `127.0.0.1`.
- [Local test server](testing/server/server.mjs): creates fake oversized cookies and serves a simulated 400 response.

The production extension has no npm dependencies or compilation step. Upload only the contents of `extension/`, with `manifest.json` at the ZIP root.

## Load The Production Build Locally

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository's `extension/` folder.
4. Open Helpdesk. The extension acts only after an HTTP 400 or 431 response; a healthy page load does not trigger cleanup.

The [testing guide](docs/TESTING.md) includes a separate local harness and checks for the production build.

## Privacy URL

The existing public policy URL remains:

[GFM Cookie 400 Recovery privacy policy](https://github.com/ecolmusgfm/gfm-cookie-400-recovery-privacy/blob/main/PRIVACY_POLICY.md)

`index.html` and the GitHub Pages workflow provide the accompanying privacy site.
