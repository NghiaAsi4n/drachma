# Drachma

A personal expense tracker PWA with a dark "Greek god" look. Offline-first, no build step, no framework.

## Run locally

```bash
python -m http.server 4173
```

Open `http://localhost:4173`.

## Project structure

```text
index.html      app shell, tab bar, sheets
style.css       theme, layout, components
app.js          state, rendering, data layer, export/import
sw.js           service worker, cache-first app shell
manifest.json   PWA manifest
icons/          192/512/maskable icons + apple-touch-icon
PLAN.md         progress checklist
```

## Deploy to Cloudflare Pages (private repo)

1. Push the repo to GitHub (private).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Select the `drachma` repository.
4. Framework preset `None`, leave the build command empty, build output directory `/`.
5. Deploy and open `https://drachma.pages.dev/`.

When Supabase sync lands (P5), add `https://drachma.pages.dev/` to Supabase → Authentication → URL Configuration → Redirect URLs.

## Install on iPhone

Safari → open the HTTPS link → **Share** → **Add to Home Screen** → launch the app from the new icon.

The installed app has its own `localStorage`, separate from a Safari tab. Install first, then enter data; anything typed in a Safari tab will not carry over.

## Data and backup

- Expenses are stored on the device in `localStorage` under the `thuchi.v1` key.
- Settings → **Export backup (JSON)** → save to Files/iCloud through the share sheet.
- iOS can clear storage under pressure or when the app is deleted, so export regularly.
- Supabase cloud sync is planned in `PLAN.md` P5 and is not implemented yet.

## Fonts

Uses the iOS system fonts: SF Pro for UI and amounts, New York for the month header. No webfonts are downloaded, so the app renders offline immediately.

## Notes

- Bump `CACHE_VERSION` in `sw.js` whenever `app.js`, `style.css`, or `index.html` changes.
- There is no backend; hosting only serves static files.
