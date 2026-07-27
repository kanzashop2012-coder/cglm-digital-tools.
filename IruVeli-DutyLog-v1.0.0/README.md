# Iru Veli Duty Log — v1.0.0

Geofenced duty sign-in and sign-out for the Rooms Division at Sun Siyam Iru Veli.
Port of CGLM Duty Log v1.5.0, on its own Firebase project — no shared data with the
CGLM tools.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `sw.js` | Service worker (offline shell, PWA install) |
| `manifest.webmanifest` | PWA manifest |
| `icon-*.png`, `apple-touch-icon.png` | App icons |
| `netlify.toml` / `vercel.json` | Cache headers — keep whichever host you use |
| `database.rules.json` | Realtime Database security rules |

## Deploy

1. Drop the whole folder on Netlify (or Vercel). `index.html` must sit at the root.
2. Open the live HTTPS URL on a phone. Geolocation will not work from `file://`
   or over plain `http`.
3. Add to Home Screen. On iOS this must be done from Safari, not Chrome.

## Connect Firebase

Until this is done the app runs in demo mode and saves to the one device only —
a yellow band at the top says so.

1. Create a Realtime Database in the Iru Veli Firebase project, region
   `asia-southeast1`.
2. Enable **Anonymous** sign-in under Authentication → Sign-in method. The app
   signs in anonymously so the rules below can require `auth != null`.
3. Paste the web config into `FIREBASE_CONFIG` near the top of the script block
   in `index.html`. `databaseURL` is the field that switches the app to live mode.
4. Publish `database.rules.json` to the database Rules tab.
5. Redeploy, then bump `CACHE` in `sw.js` from `ivdl-v1` to `ivdl-v2` so installed
   phones pick up the new build.

## First run on the island

1. Open **Settings**, unlock with the manager PIN (default `2468`).
2. Stand at the duty desk, tap **Set centre from my current position**, then
   **Save zone**. Radius defaults to 120 m.
3. Change the manager PIN off the default.
4. Open **Roster** and paste the establishment list into **Import roster**.

## Roster import format

One person per line, comma or tab separated:

```
Name, Position, Group, PIN
```

Groups: `management`, `supervisors`, `guest_relations`, `bell`.
Leave the PIN blank and it is generated from the group prefix
(14xx / 12xx / 10xx / 08xx). Rows whose PIN already exists are updated, not
duplicated.

Only three people are seeded: Mohamed Solih, Adam Zahir and Mohammed Madhin Moosa.
Everyone else comes from the import.

## Behaviour worth knowing

- Being outside the zone does **not** block a sign-in. The entry is recorded and
  flagged, and it shows up under Log → Outside zone only.
- Timestamps are stored in UTC. If a device is not on UTC+05:00 an orange band
  warns that the times on screen will not match the duty roster.
- The manager PIN is checked in the browser. It keeps honest people out of the
  roster and the log; it is not a security control. See below.

## Known limitation — PIN exposure

Any signed-in client can read the whole `roster` node, which includes staff PINs
in plain text. The rules require authentication, but anonymous auth is open to
anyone who loads the page, so treat these PINs as a convenience credential rather
than a secret.

The fix, if you want it as v1.1: store a salted SHA-256 hash of each PIN instead
of the PIN itself and have the keypad hash before lookup. A manager could then
reset a PIN but never view one, and the "Show PINs" toggle would go away.
