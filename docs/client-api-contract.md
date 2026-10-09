# MOSTLYVERS Reader API Contract

The Android client calls a versioned base URL supplied through `EXPO_PUBLIC_API_URL`; it must end in `/v1`. Responses are JSON unless a reading resource or encrypted EPUB package is returned.

## Protocol rules

- IDs are opaque strings, timestamps are UTC ISO-8601, and money is `{ "amountMinor": 39900, "currency": "INR" }`.
- Protected calls use `Authorization: Bearer <accessToken>`.
- Payment, transfer, progress, download-license, and feedback creation calls receive an `Idempotency-Key` UUID.
- Errors are `{ "error": { "code", "message", "requestId", "details"? } }`.
- Collection responses are `{ "items": [], "nextCursor": null | string }`.
- A 403 must use a stable domain code such as `DEVICE_TRANSFER_REQUIRED`, `OWNERSHIP_REQUIRED`, or `OFFLINE_LICENSE_EXPIRED`.

## Authentication and account

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/signup` | Multipart reader registration plus JSON `device`; returns `Session`. |
| POST | `/auth/login` | Credentials and `device`; returns `Session`. |
| POST | `/auth/refresh` | Rotates a refresh token and returns a complete `Session`. |
| POST | `/auth/logout` | Revokes the active refresh session. |
| POST | `/auth/password-reset/request` | Sends reset instructions without disclosing account existence. |
| POST | `/auth/password-reset/confirm` | Accepts reset token and new password. |
| GET/PATCH | `/me` | Reads or updates the reader profile. |
| POST/DELETE | `/me/profile-picture` | Replaces or removes the reader avatar. |
| GET | `/me/device-access` | Current authorization, counts, and current fee. |
| POST | `/me/device-transfer/checkouts` | Creates a verified-billing checkout for this installation. |
| GET | `/me/device-transfer/checkouts/{id}` | Recovers an interrupted transfer. |

`Session` contains access/refresh tokens, reader, `FULL | BROWSE_ONLY`, and complete device access. The first installation is authorized without incrementing `changesUsed`. A different installation remains browse-only until transfer verification completes.

## Catalog and configuration

| Method | Route |
|---|---|
| GET | `/app/bootstrap` |
| GET | `/home` |
| GET | `/books?query=&cursor=&limit=` |
| GET | `/books/{bookId}` |
| GET | `/books/latest` |
| GET | `/books/upcoming` |
| GET | `/content/about-app` |
| GET | `/content/author` |
| GET | `/content/contact` |

Book responses never include full content or a raw storage URL. They include ownership, Play product IDs, month/year publication fields, pre-book state, and whether a YouTube asset exists. Play Billing remains authoritative for the localized displayed price.

## Checkout and transaction lifecycle

| Method | Route | Purpose |
|---|---|---|
| POST | `/checkouts` | Creates `BOOK_PURCHASE`, `PREBOOK`, or `DEVICE_TRANSFER` checkout. |
| POST | `/checkouts/{id}/confirm` | Verifies Google purchase token or alternative-provider proof. |
| GET | `/checkouts/{id}` | Returns latest checkout state. |
| POST | `/billing/google-play/reconcile` | Reconciles unfinished/non-consumable Play purchases. |
| GET | `/me/transactions` | Auditable purchases, pre-books, refunds, and transfer fees. |
| GET | `/me/prebooks` | Reader pre-book records. |

The client grants access only for a `VERIFIED` response. The server must verify provider state, bind the provider purchase to the reader/device, create the immutable transaction and entitlement atomically, and acknowledge/record refunds through provider lifecycle notifications.

## Reading and offline delivery

| Method | Route |
|---|---|
| GET | `/me/books` |
| POST | `/books/{bookId}/reading-sessions` |
| GET | `/reading-sessions/{sessionId}/resources/{resourceId}` |
| GET/PUT | `/me/books/{bookId}/progress` |
| PUT/DELETE | `/me/books/{bookId}/bookmark` |
| POST | `/me/books/{bookId}/offline-license` |
| GET | `/me/books/{bookId}/offline-package/{version}` |
| POST | `/me/books/{bookId}/offline-license/renew` |
| GET/DELETE | `/me/downloads[/{bookId}]` |

Reading manifests contain resource IDs, EPUB hrefs, MIME types, spine order, bookmark, and versioned progress. Positions use `{ href, cfi?, progression, displayedPage?, displayedPageCount? }`.

Offline packages are complete EPUB ZIP bytes encrypted with AES-256-GCM. The API returns a 32-byte content key and 12-byte nonce as base64; the binary response is `ciphertext || 16-byte authentication-tag`. `checksumSha256` covers that encrypted binary and `contentLength` is its exact byte count. Licenses expire after 30 days. The download route must support bearer authentication and should support HTTP range requests.

## Feedback and YouTube

| Method | Route |
|---|---|
| GET/POST/PATCH | `/me/books/{bookId}/feedback` |
| GET | `/youtube-assets` |
| GET | `/books/{bookId}/youtube-asset` |

Locked YouTube records omit both URL and QR payload. Feedback endpoints require ownership and the authorized device; updates preserve `createdAt` and set `updatedAt`.

## Android integrity

When `EXPO_PUBLIC_GOOGLE_CLOUD_PROJECT_NUMBER` is configured, login/device context and checkout requests include `integrityToken` and `integrityRequestHash`. The backend must decrypt the Play Integrity verdict, verify the request hash, package/signing identity, account/device verdicts, and freshness before accepting sensitive mutations.
