# ReliefGrid

Dual-console hackathon prototype:

- **Residents** (`/user/*`): register with full address, browse hubs, **1-hour holds** from reservation (24h clock display), donate (tickets), redeem points. No warehouse ticket desk or staff tools here.
- **Warehouse admin** (`/admin/*`): demo login **`admin@warehouse.com` / `123456`**, edit **inventory by lane**, **accept / close donation tickets** (credits go to the donor’s email — applied live if they’re signed in, otherwise queued in a ledger until next login).

Nutrition urgency uses **lane-colored pills with category names** (e.g. “Protein” in red), not the words “Critical / Stable”.

## Run locally

```bash
cd relief-hub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Legacy URLs `/app/*` and `/login` redirect to `/user/*` and `/user/login`.

## Demo flow

1. **Register** at `/user/register` (or sign in at `/user/login`).
2. **Hub** (`/user/home`): phase controls (demo dock), map, lane pills per hub.
3. **Warehouse**: reserve basket; **countdown** shows **24h-format** end time from registration (optional ~3 min judge mode).
4. **Donate**: create ticket → **Admin** `/admin/dashboard` → **Close + credit**.
5. **Redeem** as resident: spend points (one bonus per “visit” simulation).
6. **Reset** (demo dock, resident shell) clears app state **and** demo accounts.

## Security

Demo accounts store passwords in `localStorage` — **not for production**. Never commit real secrets.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Lucide · client-side persistence.
