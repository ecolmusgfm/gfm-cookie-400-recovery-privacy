# GFM Cookie 400 Recovery Privacy Policy

Last updated: August 6, 2026

GFM Cookie 400 Recovery is an internal Chrome extension used to restore access to `helpdesk.gofundme.com` when oversized GoFundMe cookies cause HTTP 400 or 431 errors.

## Single Purpose

The extension has one purpose: detect HTTP 400 or 431 responses on top-level Helpdesk page loads and clear only the allowlisted GoFundMe cookies needed to recover the page.

## Data Processed Locally

The extension processes data locally in the user's browser. It observes only top-level navigation responses for `helpdesk.gofundme.com`, including the request URL, response status code, tab identifier, and request type.

When recovery is needed, the extension uses Chrome's cookies API for GoFundMe domains. Chrome cookie records can include authentication cookie values, but the extension uses only the cookie name, domain, path, security flag, store ID, and partition key needed to remove allowlisted cookies. Cookie values are not displayed, stored, logged, transmitted, sold, or shared.

## Cookies Removed

The extension removes only these GoFundMe cookie names:

- `DSR`
- `DTD`
- `passport2`
- `trident_idToken`
- `trident_accessToken`
- `trident_refreshToken`
- `frs_idToken`
- `frs_accessToken`
- `frs_refreshToken`

## What The Extension Does Not Do

- It does not transmit user data to GoFundMe servers, developer servers, Google APIs, or third parties.
- It does not collect analytics or telemetry.
- It does not store user data.
- It does not read page content, form fields, messages, screenshots, or user activity.
- It does not use remote code.
- It does not sell or transfer user data.

## Limited Use Statement

Use of information handled by this extension complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. Data handled by the extension is used only to provide the extension's single Helpdesk recovery purpose.

## Contact

For questions about this internal extension, contact the GoFundMe IT or Helpdesk team through the normal internal support channels.
