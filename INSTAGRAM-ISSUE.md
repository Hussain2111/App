# Instagram account discovery investigation

Recorded November 7, 2026. Status: functionality recovered, root-cause investigation deferred to backlog at the user's request.

## Scope and current result

Trellis uses Angular, Go, SQLite, SCS sessions, and Instagram API with Unified Login. The intended integration connects a client's professional Instagram account to an authenticated Trellis user. The app and client retain separate business portfolios.

OAuth account discovery now succeeds with the user's earlier oauth.go restored exactly from VS Code local history. Connection persistence and the Angular connection workflow remain work for the user to implement.

The original cause of empty discovery has not been proven. No particular backend change, webhook change, token difference, or Meta-side delay is established as that cause.

## Configuration and identities

- Trellis app ID: 1645303623814124.
- Unified Login configuration ID: 1131336323191876.
- App owner portfolio: Hussain, 1692266728998639.
- Client portfolio: kbeauty_klub, 388546133424670.
- Instagram account: glowithuzma, 17841402326320043.
- Authorization endpoint: https://www.facebook.com/dialog/oauth.
- Graph API base: https://graph.facebook.com/v27.0.
- Code exchange endpoint: /oauth/access_token.
- OAuth callback: https://lunar-disown-heaving.ngrok-free.dev/auth/instagram/callback.
- OAuth start: /auth/instagram/start.
- Webhook callback: /webhooks/instagram on the same public host.
- Development request routing: ngrok to Angular on port 4200, then the Angular proxy to Go on port 8080.
- Configuration was verified in Meta as Instagram Login Compatible, General variation, system-user token, never expires.
- Permissions: instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights, instagram_manage_messages. Token inspection also showed public_profile.
- App was unpublished with Standard Access. The user reported accepting the Instagram Tester invitation, and glowithuzma appeared in app roles.
- Consent screenshots showed kbeauty_klub and glowithuzma selected, with the requested Instagram capabilities on the review screen. Ad account selection was optional and blank.

## Failure and investigation chronology

### Initial implementation failures

1. Saving a time.Time value in the SCS session produced `gob: type not registered for interface: time.Time`. The redirect response also produced a superfluous WriteHeader warning. Expiry storage was changed to an int64 Unix timestamp, after which OAuth proceeded.
2. Refreshing or reusing a consumed callback could produce `Invalid OAuth state`. Each authorization starts with fresh state. State is checked against the session and removed before continuing.
3. Token exchange returned HTTP 400, OAuthException code 100, subcode 36008. The earlier pasted exchange omitted redirect_uri. Subsequent code included the same redirect_uri as authorization, and exchange succeeded. The full upstream error message was not retained, so the subcode's precise explanation was not independently established in this record.
4. Token exchange success initially ended at a deliberately unfinished account-verification response.

### Account discovery failure

The account discovery request was GET /me/assigned_instagram_accounts with fields=id,username and the callback-issued access token. It returned HTTP 200 with an empty data array. Go reported no accounts. Graph API Explorer also returned an empty data array in earlier attempts.

A direct request for /17841402326320043 returned GraphMethodException code 100, subcode 33. Its message allowed several explanations, including missing permissions or an inaccessible object. It did not identify a unique cause.

An intermediate November 5 saved version used the direct account endpoint while continuing to decode a data array. This was a response-shape mismatch. It does not explain the later empty array from the correct assigned_instagram_accounts endpoint in Explorer.

Earlier token inspection showed the correct app, valid SYSTEM_USER token, required scopes, and no expiry. Explorer's `not you` warning reflected a different token identity from the logged-in developer. Token identity differences between individual failed and successful attempts were not recorded reliably.

### Webhook setup

Webhook verification initially failed. The ngrok traffic policy required Google authentication, including for incoming Meta requests. The exact /webhooks/instagram path was exempted from both the authentication and email-deny rules. Public verification subsequently returned HTTP 200 and the challenge value.

On November 6 at 16:22:42 the Go log showed one webhook entry with a verified signature. A later audit found that the tester account subscription was Off and all webhook fields were Unsubscribed. Successful test delivery had previously been overstated as complete webhook setup.

With the user's approval, the account's webhook subscription was enabled and the comments field was subscribed at v27.0. Meta displayed success confirmations. A subsequent OAuth report still showed empty account discovery. A delayed relationship between these changes and eventual success has not been established or ruled out.

### Diagnostic implementation

The callback was temporarily refactored into oauth_audit.go with sequential reports for callback validation, token exchange, client business identity, and account discovery. Tests mocked responses and checked request parameters, error handling, and credential exclusion. An audit markdown file recorded the investigation.

The first business-identity check incorrectly required both id and client_business_id, although its request selected only client_business_id. Meta returned HTTP 200 with client_business_id 388546133424670 and omitted id. This diagnostic requirement prevented discovery from running. It was corrected to require only the requested business ID.

After that correction, callback validation, exchange, and business identity passed, while account discovery still returned HTTP 200 with an empty account list.

An additional GET /debug_token request inspected the same callback token before discovery. Its result was diagnostic and did not replace the token or change discovery parameters. It added a network request and elapsed time.

### First successful discovery

The next supplied report showed all checkpoints passing and returned glowithuzma. Token metadata showed:

- app_id 1645303623814124.
- type SYSTEM_USER and is_valid true.
- user_id 122098945863538643.
- The five Instagram permissions listed above plus public_profile.
- Granular scope entries for those Instagram permissions with no target_ids.
- expires_at and data_access_expires_at both zero.

Meta's debug_token documentation states that target IDs may be omitted when a granular scope applies to all objects. Their absence alone did not prove a missing asset grant.

The user then obtained glowithuzma from Graph API Explorer using the discovery request. They believed it might be the earlier token but were unsure. Successful lookup proves current access for the pasted token, while exact equality to the earlier failing token remains unknown.

### Comparisons after success

1. Removed /debug_token and its metadata types/tests. The user completed fresh OAuth and discovery still returned glowithuzma.
2. Removed audit reporting and business-identity lookup, putting exchange and discovery directly in oauth.go. The user completed fresh OAuth and received the account in a data array.
3. Restored oauth.go byte-for-byte from VS Code history snapshot 6l7Z.go, timestamp November 5, 2026, 22:18:11 Arabia Standard Time. File hash equality was verified. Existing Go tests passed. The user completed fresh OAuth and supplied:

```json
{"account_count":1,"accounts":[{"id":"17841402326320043","username":"glowithuzma"}],"client_business_id":"388546133424670"}
```

The restored snapshot already contained redirect_uri in the exchange, Unix state expiry, the assigned_instagram_accounts endpoint, fields=id,username, decoding of the data array, and the subsequent business lookup.

## Current files and evidence limits

- go-sqlite/oauth.go is the restored historical implementation that produced the final successful response above.
- oauth_audit.go, oauth_audit_test.go, and INSTAGRAM-AUDIT.md were removed during cleanup.
- webhooks.go, webhooks_test.go, webhook route registration, proxy configuration, and the ngrok webhook exemption remain.
- This comparison restored oauth.go only. It did not restore the entire project or Meta configuration to the earlier state.
- The historical snapshot is stored under C:/Users/Hussain/AppData/Roaming/Code/User/History/-2cb41c09/6l7Z.go. Git had no committed version of oauth.go.
- Tests verified local implementation behavior. User-supplied live callback and Explorer responses establish the real discovery successes.
- Tokens, authorization codes, app secrets, and webhook verify tokens are deliberately excluded from this issue record.

## Backlog item IG-001

Title: Determine why Unified Login initially returned no assigned Instagram accounts.

Status: Deferred. Current discovery is working. Resume when the user chooses to investigate.

Questions to resolve:

- Did the failing and successful requests use the same token and integration user identity?
- Did the grant or asset assignment change between authorization attempts?
- Did earlier Meta configuration or webhook changes take effect later?
- Did the order or timing of requests affect newly issued tokens?
- Were any other project or environment changes material?

If the failure recurs, capture the exact endpoint/version/fields, sanitized status and response, elapsed time after exchange, token metadata, and a one-way token fingerprint. Compare a failing and successful request with the same token before altering configuration. Inspect historical code and grants before choosing experiments. Avoid recording raw credentials.

Completion requires evidence connecting a specific condition to failure and its correction to success. A plausible explanation alone is insufficient. Restored oauth.go succeeding today establishes that the later OAuth rewrites are unnecessary under current conditions, while the historical cause remains open.

## Backlog item IG-002

Title: Finish the setup pages' placeholders and previews.

Status: Deferred at the user's request on November 7, 2026. Prioritize working Instagram data on the dashboard.

Scope:

- Replace the step 1 authorization preview placeholder with a finished visual or useful account-connection guidance.
- Review steps 1, 2, and 3 for remaining demo text, preview labels, and placeholder content.
- Make copy reflect the actual connection and data-loading state.
- Check button spacing and responsive layouts across the setup pages.

Completion requires all three setup pages to use accurate content and finished previews, with loading and error states checked. The connected username, Instagram ID, and dashboard follower count must continue to use real data.

## Documentation consulted during the investigation

- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/business-onboarding
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/permissions
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/eligibility-and-troubleshooting
- https://developers.facebook.com/docs/graph-api/reference/v27.0/debug_token
- https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#apptokens

Some automated fetches failed or returned HTTP 429. The Meta pages were subsequently read through the browser during the investigation. No missing mandatory pre-discovery request was identified from those pages.
