CGLM DUTY LOG v1.5.0 — installable app
Centara Grand Lagoon Maldives · Front Office (FO 101)
Live at: https://cglm-duty-log.vercel.app

-------------------------------------------------------------------
CURRENT STATUS
-------------------------------------------------------------------
  DONE      Deployed to Vercel, installable, roster of 22 loaded,
            zone centred on 4.311059 / 73.348878 at 120 m.
  PENDING   Firebase not connected — the app is in DEMO MODE and
            every record clears on reload. See step 1 below.
  PENDING   Firebase security rules. The database is open until
            these are written. Do not rely on the log formally
            before this is done.

-------------------------------------------------------------------
1. CONNECT FIREBASE  (do this first — nothing is saved until it is)
-------------------------------------------------------------------
  Create the DATABASE before registering the web app. In the other
  order Firebase hands you a config with no databaseURL in it, and
  that is the one field this app cannot run without.

  a. console.firebase.google.com -> Add project -> "cglm-duty-log"
     Turn Google Analytics OFF.
  b. Build -> Realtime Database -> Create Database
     Location: Singapore (asia-southeast1). Start in test mode.
  c. Settings (gear) -> Project settings -> General -> Your apps
     -> web icon </> -> register -> copy the firebaseConfig block.
  d. Open index.html, find  const FIREBASE_CONFIG = {  near the top.
     Paste your seven values in. Check databaseURL is present:
       https://cglm-duty-log-default-rtdb.asia-southeast1.firebasedatabase.app
  e. Redeploy (section 3).

  CONFIRM: Manager -> Rules -> Connection must read
           "Live · Firebase Realtime Database".
           If it says Demo, the config did not save.

  NOTE  The config must live in index.html, not in phone storage.
        It identifies the database, not the user. Every phone that
        loads the page needs it.

  WARNING  Test mode leaves the database world-readable and expires
           after 30 days. Write the security rules before then.

-------------------------------------------------------------------
2. FILES — keep them together at the root
-------------------------------------------------------------------
  index.html              the whole app
  manifest.webmanifest    makes it installable
  sw.js                   offline shell + update detection
  vercel.json             cache headers (Vercel)
  _redirects              ignored by Vercel, kept for Netlify
  icons/                  app icons

  Nesting these inside another folder is the usual cause of a
  deploy that succeeds but serves a blank page or a 404.

-------------------------------------------------------------------
3. DEPLOYING AN UPDATE
-------------------------------------------------------------------
  BEFORE EVERY DEPLOY, bump BOTH version strings:
    index.html   const APP = { ... version:'1.5.0' }
    sw.js        const VERSION = 'duty-log-v1.5.0'

  The sw.js one is what forces installed phones to drop their cache.
  Miss it and phones keep serving the old build with no error and no
  visible sign anything is wrong. The index.html one prints in
  Manager -> Rules -> Connection, so you can confirm on a real phone
  which build is live.

  Also confirm FIREBASE_CONFIG is still filled in — a fresh copy of
  the bundle has it blank.

  Then pick one:
    DROP  Vercel project page -> drag the FOLDER onto the page.
          Fast. No history, no rollback.
    CLI   cd into the folder -> vercel link (once) -> vercel --prod
    GIT   Connect a repo in Settings -> Git. Every push deploys.
          Best option — gives you a diff and a rollback for every
          change, which matters for a file holding attendance data.

  VERIFY  Manager -> Rules -> Connection shows the new version.
          Installed phones show "A new version is ready" on open.

  ROLLBACK  Deployments tab -> last good one -> ... -> Promote to
            Production. Near instant.

  TIMING  A deploy takes effect for everyone at once, mid-shift.
          Push in the quiet hours, not at 08:00 or 21:00 when the
          team is trying to record.

-------------------------------------------------------------------
4. INSTALLING ON A PHONE
-------------------------------------------------------------------
  Android / Chrome  Open the link, tap the gold Install chip in the
                    header.
  iPhone / iPad     Open the link IN SAFARI, tap Share, scroll,
                    Add to Home Screen. Chrome and Firefox on iOS
                    cannot install web apps at all.

  The gold Install chip is also how you tell v1.5.0 from an older
  build at a glance. No chip means the wrong file is deployed.

  PHONE STUCK ON AN OLD VERSION
    Android  long-press icon -> App info -> Storage -> Clear storage
    iOS      delete the icon, reopen in Safari, Add to Home Screen
    Browser  hard reload, or clear site data for the domain

-------------------------------------------------------------------
5. FIRST RUN
-------------------------------------------------------------------
  Manager PIN is 2468. Change it in Manager -> Rules before sharing
  the link. It gates the log, exports, all 22 staff PINs, the zone
  and the shift rules.

  Zone: 4.311059 / 73.348878, radius 120 m, max GPS error 75 m.
  Stand at the Front Office desk and use "Use my current position as
  centre" once, on a good fix, to settle it properly. Then walk to
  the furthest point a GRO could legitimately be on duty, read the
  distance off the dial, and set the radius to that plus about 30 m
  for GPS noise. Too tight and honest sign-ins land on the exception
  list, which trains everyone to ignore it.

  Roster loads 22 names automatically. Xinping He is paused pending
  arrival — activate her row on the day she starts. The three vacant
  positions (FOM, and the two festive hires) are shown for headcount
  only and cannot be signed in against.

  Staff PINs follow salary band plus sequence: Duty Managers
  1401-1403, Supervisors 1201-1203, GRO 1001-1011, Bell 0801-0805.
  These are sequential and therefore guessable. Have everyone set
  their own with "Change my PIN" in the first week.

-------------------------------------------------------------------
6. HOW IT BEHAVES
-------------------------------------------------------------------
  Records four events: sign in, step out (with reason), back on
  duty, sign out. Each stores time, GPS position, accuracy, distance
  from the desk, and the phone's timezone.

  Nothing is blocked. Recording from outside the zone is allowed and
  goes on the manager exception list with the distance. Weak GPS is
  flagged, not refused. A phone set to the wrong timezone is flagged.
  A location fix is the one hard requirement.

  This makes the geofence an evidence tool, not an enforcement one.
  It only works if someone reviews the exception list daily — put it
  in the Duty Manager's morning handover, or outside sign-ins quietly
  become normal within a few weeks.

  Offline: the app opens, but records cannot be saved and it says so.
  A stale board is worse than a blank one.
