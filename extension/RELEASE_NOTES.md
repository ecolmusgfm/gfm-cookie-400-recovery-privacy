# GFM Cookie 400 Recovery v1.0.0

## Purpose

This internal Chrome extension is a stopgap for Helpdesk users who hit `400 Bad Request` or `431 Request Header Fields Too Large` because GoFundMe-domain cookies make the request header too large.

## Behavior

- Watches only top-level navigations to `https://helpdesk.gofundme.com/*`.
- Acts only on `400` or `431` responses.
- Removes only selected GoFundMe cookie names.
- Reloads the Helpdesk tab only if at least one selected cookie was actually removed.
- Does not use `chrome.browsingData.remove`.
- Does not read or transmit cookie values.
- Does not make network calls.

## Cookie Names Removed

```text
DSR
DTD
passport2
trident_idToken
trident_accessToken
trident_refreshToken
frs_idToken
frs_accessToken
frs_refreshToken
```

## Expected User Impact

Affected users may be signed out of GoFundMe, Pro, Helpdesk, or related GoFundMe services after recovery. They should be able to sign in again normally.

## Rollback

Remove or disable the extension through Chrome Enterprise policy, or publish a new version with the cleanup behavior disabled.
