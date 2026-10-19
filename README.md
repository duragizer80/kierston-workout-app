# Kierston Train

Phone-first workout companion for Kierston’s trainer email library.

**Live:** https://duragizer80.github.io/kierston-workout-app/

## Features

- **Home** — continue active session, last started, favorites
- **Library** — era sections (2020–21 / Gmail / iCloud peak / undated), interactive **body map**, equipment chips, search by exercise
- **1–5 star ratings** + **♥ favorites** (localStorage); sort by rating, date, or name/signature
- Workout detail with blocks, prescriptions, unclear markers, and catalogue hints (standard name / body parts)
- Guided session with **ghost last-weight prefill**, auto **rest timer** after sets, resume
- On-device session history (localStorage)
- Installable PWA (HashRouter for GitHub Pages)

## Exercise catalogue mapping

Unique trainer exercise strings (299 in the current library) are mapped in
`src/data/exercise-map.json` for body / equipment tags and optional “standard name”
labels. Rebuild with:

```bash
node scripts/build-exercise-map.mjs
```

**Source & license:** This is a **small derived mapping** for our strings only — heuristics
plus a short ExerciseDB-style seed list of common exercise vocabulary (names, body parts,
equipment). It is **not** a wholesale dump of [ExerciseDB](https://github.com/yuhonas/free-exercise-db)
or of [openGym](https://github.com/DuarteSantos8/openGym) catalogue JSON.

**Not included:** openGym is AGPL-3.0; their exercise **media** (animations / Gym visual)
is separately licensed and **not** reused here. No GIFs or demo videos are vendored.

## Develop

```bash
npm install
npm run dev
```

Production build uses base path `/kierston-workout-app/` for GitHub Pages.

```bash
npm run build
npm run preview
```

## Deploy

Built files are on the **`gh-pages`** branch (site root). Prefer this if Pages Source has no “GitHub Actions” option.

### Enable Pages (branch deploy) — do this once

1. Make the repo **Public** (Settings → General → Danger zone) so the site opens without a GitHub login.
2. Open **https://github.com/duragizer80/kierston-workout-app/settings/pages**
3. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
4. Click **Save**. Wait ~1 minute, then open:  
   **https://duragizer80.github.io/kierston-workout-app/**

### Refresh the published site after code changes

```bash
npm run publish:gh-pages
```

Optional: `.github/workflows/deploy-pages.yml` still supports Actions-based Pages if that Source option appears later.

## Invite collaborator (Kierston)

1. Open https://github.com/duragizer80/kierston-workout-app/settings/access
2. **Add people** → enter her GitHub username or email → choose role (Write or Maintain)
3. She accepts the email invite

## Open on devices

### iPhone

1. Safari → https://duragizer80.github.io/kierston-workout-app/
2. Share → **Add to Home Screen**
3. Open the icon for full-screen gym mode (logs stay on-device)

### Chromebook

1. Chrome → same URL
2. Optional: install / create shortcut from the browser menu
3. Works offline after first visit (service worker)
