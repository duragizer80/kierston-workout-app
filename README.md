# Kierston Train

Phone-first workout companion for Kierston’s trainer email library.

**Live:** https://duragizer80.github.io/kierston-workout-app/

## Features

- Browse / search / year filter across 63 transcribed workouts
- Workout detail with blocks, prescriptions, and **unclear** markers preserved
- Guided session with weight/reps logging and last performance recall
- Rest timer
- On-device session history (localStorage)
- Installable PWA

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

Pushes to `main` run `.github/workflows/deploy-pages.yml` (GitHub Actions → Pages).

### One-time owner setup (required)

The deploy workflow builds successfully; Pages must be turned on by a repo admin (API tokens from this agent cannot enable it):

1. Open **https://github.com/duragizer80/kierston-workout-app/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Prefer making the repo **Public** (Settings → General → Danger Zone) so Kierston can open the site without a GitHub login (private Pages needs GitHub Pro)
4. Re-run the failed **Deploy GitHub Pages** workflow: Actions → latest run → **Re-run jobs**

Live URL after that: **https://duragizer80.github.io/kierston-workout-app/**

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
