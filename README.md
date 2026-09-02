# Hospital Visitor Tracker — Ahmedabad

A simple **web app** (no app to install) for tracking everyone who enters the hospital:
visitors check in by scanning a QR code, get a digital badge on their phone, and are
**checked out automatically** — either when they leave the hospital area (100 m GPS
geofence) or after 3 hours, whichever comes first. Staff can also check people in and
out on a tablet at the gate, and you get a live dashboard with Excel export.

Pages (all work on any phone browser, English + Gujarati):

| URL | Who uses it |
|---|---|
| `https://your-site.netlify.app/` | Visitors — scan the QR at the entrance |
| `.../kiosk` | Gate staff — big-button tablet mode (PIN protected) |
| `.../admin` | You / management — live dashboard (PIN protected) |
| `.../print-qr` | QR codes ready to print |

---

## 15-minute setup (Supabase + Netlify)

The app runs on **Netlify** (free tier is plenty). One honest detail: Netlify hosts the
app but not a shared database, so visitor records live in **Supabase** (free tier, no
credit card). You set it up once — everything after is automatic.

### Step 1 — Create the database (5 min)

1. Go to **https://supabase.com** → *Sign up* (free) → *New project*.
   Pick any name, a strong database password, and a region close to India
   (e.g. *Mumbai* or *Singapore*).
2. Wait ~1 minute for it to finish, then in the left menu open **SQL Editor** → *New query*.
3. Copy the **entire contents of `supabase/schema.sql`** (in this folder) and paste it,
   then click **Run**. You should see "Success".
4. Open **Project Settings → Database** (or *API*). You need two values:
   - **Project URL** — looks like `https://xxxx.supabase.co`
   - **service_role key** (secret) — copy it carefully, shown only once.

   Keep these two values safe; you'll paste them into Netlify in Step 3.

### Step 2 — Create the Netlify site (5 min)

Easiest: push this folder to a **GitHub** repository (free account), then:

1. Go to **https://app.netlify.com** → *Add new site* → *Import an existing project*
   → pick the repository.
2. Netlify auto-detects the build settings from `netlify.toml`
   (build command `npm run build`, publish folder `dist`). Just click **Deploy**.
3. The first deploy takes ~2–3 minutes.

*(Alternative without GitHub: install Node.js, then run
`npm install -g netlify-cli && netlify login` in this folder, and
`netlify deploy --prod`. It asks you to link/create a site.)*

### Step 3 — Connect the database (2 min)

1. In Netlify: your site → **Site configuration** → **Environment variables** → *Edit*.
2. Add these variables:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | the Project URL from Step 1 |
| `SUPABASE_SERVICE_KEY` | the service_role key from Step 1 |
| `ADMIN_PIN` | your 4-digit PIN for staff/dashboard (e.g. `4321` — don't use 1234) |

3. (Optional) personalise the app:

| Variable | Default | What it changes |
|---|---|---|
| `HOSPITAL_NAME` | `Your Hospital Name, Ahmedabad` | name shown on every screen |
| `HOSP_LAT` | `23.0225` | **your hospital's location — MUST change** |
| `HOSP_LNG` | `72.5714` | **your hospital's location — MUST change** |
| `HOSP_RADIUS` | `100` | auto check-out distance in metres |

**How to get your hospital's coordinates:** open Google Maps on your phone →
long-press (or right-click) on your hospital's gate → copy the coordinates.
They look like `23.0296, 72.5750`. Put the first number in `HOSP_LAT` and the
second in `HOSP_LNG`.

4. Save. Netlify **redeploys automatically**. Done — the app is live.

---

## Day-to-day use

1. **QR codes:** open `.../admin`, enter your PIN, click **Print QR codes**, and print.
   Put the *Self Check-In* QR at every entrance; the *Staff Kiosk* QR on the gate tablet.
2. **Visitor:** scans QR → enters name/phone/reason (30 seconds) → shows the digital
   badge at the gate. If they keep the badge screen open, leaving the hospital
   (100 m) checks them out automatically. Otherwise they're auto checked out after 3 h,
   or the staff can check them out on the tablet/dashboard.
3. **You:** `.../admin` → live list of who is inside, search by name/phone, filter by
   purpose/ward, **Export CSV** for audit or authority queries.
4. The system auto-checks out stale entries and **deletes records after 90 days**
   (DPDP-friendly; a consent line is shown at check-in).

## Run it locally (for testing on your laptop)

```bash
npm install
npm run icons
npm run build
npm start
```

Then open `http://localhost:8787` (PIN defaults to `1234`; override with
`ADMIN_PIN=4321 npm start`). Local mode stores data in `server/data.json` —
no Supabase needed for a quick demo.

## Notes & honest limitations

- **Auto check-out needs the badge screen open.** Phones (Android/iOS) do not allow
  any website to track location in the background — that's an OS privacy rule, no
  app-free workaround exists. The 3-hour timeout covers everyone who closes the page.
- The dashboard PIN is a simple first line of defence, not true security; keep the
  PIN private and don't share it on public computers.
- **Phase 2 ideas** (already on the roadmap from our discussion): SMS/WhatsApp
  "tap to check out" link, daily summary reports, visitor blacklist, Gujarati-only
  kiosk mode.

## Project layout

```
src/                     React frontend (check-in, badge, kiosk, dashboard)
server/dev-server.mjs    local dev server (same API, JSON-file storage)
netlify/functions/       serverless backend (Supabase-backed) + scheduled cleanup
supabase/schema.sql      one-time database setup
```
