# Maintaining GFM Cookie 400 Recovery

Run commands from the repository root. The production build is in `extension/`. It uses a Manifest V3 service worker and has no npm dependencies or compilation step.

## Behavior And Permissions

`background.js` observes completed top-level requests to `https://helpdesk.gofundme.com/*`. It handles HTTP 400 and 431 responses, obtains GoFundMe cookie records, filters them by domain and the exact nine-name allowlist, and removes matching cookies. It reloads the affected tab only after at least one successful removal. A ten-second in-memory guard limits repeated cleanup for the same tab and URL.

The manifest includes:

- `cookies`: obtain and remove the selected GoFundMe cookies.
- `webRequest`: observe the response status of Helpdesk page navigations.
- GoFundMe host permissions: access the cookies in scope and observe the Helpdesk requests.

The release does not request the `tabs` permission. The service worker reloads the affected tab using `chrome.tabs.reload`.

## Preserved v1.0.0 Package

[`releases/gfm-cookie-400-recovery-1.0.0.zip`](../releases/gfm-cookie-400-recovery-1.0.0.zip) is the original no-tabs upload ZIP. Its four root files are:

```text
manifest.json
background.js
RELEASE_NOTES.md
drawing-chrome-icon-128.png
```

The source in `extension/` matches these package entries. The icon is a 128 x 128 PNG.

## Prepare An Update

1. Edit the production files in `extension/`.
2. Increment `version` in `extension/manifest.json` above the version currently published in the Chrome Web Store. Document the change in `extension/RELEASE_NOTES.md`.
3. Run syntax and manifest checks:

   ```sh
   node --check extension/background.js
   node -e 'JSON.parse(require("node:fs").readFileSync("extension/manifest.json", "utf8")); console.log("Manifest JSON is valid");'
   ```

4. Run the relevant checks in [TESTING.md](TESTING.md), including the production behavior affected by the change.
5. Create a ZIP with the manifest at its root. For v1.0.0, the command is:

   ```sh
   mkdir -p dist
   zip -X -j dist/gfm-cookie-400-recovery-1.0.0.zip \
     extension/manifest.json \
     extension/background.js \
     extension/RELEASE_NOTES.md \
     extension/drawing-chrome-icon-128.png
   unzip -l dist/gfm-cookie-400-recovery-1.0.0.zip
   ```

   For a new version, change the ZIP filename to match the manifest version. Include any new runtime files in the packaging command.

6. Commit the source and documentation together. Archive each future upload ZIP under `releases/` with its version in the filename.

## Update The Chrome Web Store Item

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and select the existing **GFM Cookie 400 Recovery** item.
2. Open **Package**, choose **Upload New Package**, and upload the ZIP for the new version.
3. Review the listing, privacy disclosures, permission justifications, and distribution settings for changes introduced by the update.
4. Submit the update for review and select the desired publication timing.
5. After publication, install or update the Web Store copy and repeat the affected production checks.

Google documents the package upload, version increment, review, and publication process in [Update your Chrome Web Store item](https://developer.chrome.com/docs/webstore/update).

The privacy policy URL is:

[GFM Cookie 400 Recovery privacy policy](https://github.com/ecolmusgfm/gfm-cookie-400-recovery-privacy/blob/main/PRIVACY_POLICY.md)

## Rollback

For an immediate per-user rollback, disable or remove the extension in `chrome://extensions`. For a managed installation, have IT disable or remove it through the relevant Chrome Enterprise policy.

For a replacement Web Store build, restore the desired behavior or disable automatic cleanup, assign a version higher than the current published version, and use the update process above. Removing the extension stops future cleanup; it does not restore cookies that were already removed. Affected users can sign in again.

## Troubleshooting

- **No recovery log:** confirm the production extension is enabled and the top-level Helpdesk response is HTTP 400 or 431. Healthy responses do not trigger cleanup.
- **No selected cookies removed:** no matching cookie was successfully deleted, so the extension leaves the tab alone.
- **Repeated cleanup skipped:** the same tab and URL encountered another error within the ten-second in-memory guard.
- **Removal failed:** inspect the extension service worker Console for `Failed to clear selected GoFundMe cookies after Helpdesk error response:` and the accompanying error.
- **Local server cannot start:** port 8787 may already be in use. Stop the conflicting process before starting the harness.
