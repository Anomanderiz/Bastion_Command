# ⚔ Bastion Manager

A multiplayer D&D 2024 Bastion management app. Each player builds and manages their own Bastion with all 47 facilities (Core, Forgotten Realms, Eberron), hirelings, and defenders.

## Setup

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and open your project (or create one).
2. In the dashboard, go to **SQL Editor**.
3. Paste the contents of `bastion-schema.sql` and click **Run**.
4. Go to **Settings → API** and note your **Project URL** and **anon public** key.

### 2. Local Development

```bash
git clone <your-repo-url>
cd bastion-manager
npm install
npm run dev
```

Open `http://localhost:5173`, enter your Supabase URL and anon key, and you're in.

### 3. Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
3. Framework Preset: **Vite** (Vercel auto-detects this).
4. Click **Deploy**. Done.

No environment variables needed — the Supabase credentials are entered by each user in the app and stored in their browser's localStorage.

### 4. Share with Your Party

Give your players:
- The Vercel URL (e.g. `bastion-manager.vercel.app`)
- Your Supabase **Project URL** and **anon key** (these are safe to share — they're public/anon)
- The **party join code** (shown after you create a party)

## Project Structure

```
bastion-manager/
├── index.html          # Vite entry point
├── vite.config.js      # Vite config
├── package.json
├── bastion-schema.sql  # Run this in Supabase SQL Editor
└── src/
    ├── main.jsx        # React mount
    ├── index.css       # Global styles
    ├── App.jsx         # Main application
    ├── data.js         # All 47 facilities + constants
    └── supabase.js     # Lightweight REST client
```

## Features (Phase 1)

- **Multiplayer**: Create/join parties with a 6-character code
- **47 Special Facilities**: All Core (29) + Forgotten Realms (8) + Eberron (10)
- **Bastion Builder**: Add/remove facilities with level gating and slot limits
- **Hirelings**: Name and assign roles per facility
- **Defenders**: Recruit and track through Barracks
- **Party View**: See everyone's bastions at a glance
- **Level Management**: Update level, slots auto-adjust
- **Persistent**: All data in Supabase, survives browser restarts

## Roadmap

- [ ] Bastion Turn Manager (issue orders, roll events with d100 table)
- [ ] Visual Grid Map Editor (drag-and-drop facility layout)
- [ ] Facility option pickers (garden types, pub beverages, trainers, etc.)
- [ ] Defensive wall calculator
- [ ] Bastion event history log
