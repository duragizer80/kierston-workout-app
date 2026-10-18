# Kierston Train

Phone-first workout companion for Kierston’s trainer email library.

**Live:** https://duragizer80.github.io/kierston-workout-app/

## Features

- **Home** — continue active session, last started, favorites
- **Library** — era sections (2020–21 / Gmail / iCloud peak / undated), equipment chips, search by exercise
- **1–5 star ratings** + **♥ favorites** (localStorage); sort by rating, date, or name/signature
- Workout detail with blocks, prescriptions, and **unclear** markers preserved
- Guided session with weight/reps logging, rest timer, resume
- On-device session history (localStorage)
- Installable PWA (HashRouter for GitHub Pages)

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
npm run build
# then publish dist/ to gh-pages (orphan/root), or ask the agent to re-push gh-pages
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
