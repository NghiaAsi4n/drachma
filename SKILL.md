---
name: pwa-expense-tracker
description: Build a simple, offline-first personal expense tracker as an installable PWA (vanilla HTML/CSS/JS, no build step) with a dark "Greek god" look. Use when the user asks for a thu chi / expense / budget app, a PWA money tracker, or mentions the Walti-style overview/history/analytics layout.
---

# PWA Expense Tracker — Greek God vibe

Personal use only. Keep it small, fast, and fully usable offline. No ads, no premium banner, no build tooling. Accounts and cloud sync are optional via Supabase — see Cloud sync.

## Stack (fixed)
- Vanilla HTML + CSS + JS (ES modules ok). Zero build dependencies. Charts drawn with inline SVG/CSS.
- Storage: `localStorage` (key `thuchi.v1`) holding one JSON object — the local cache, and the only store when signed out. Supabase mirrors it when signed in.
- PWA: `manifest.json`, `sw.js` (cache-first app shell), icons 192/512 + maskable, `<meta name="theme-color">`, iOS meta tags (`apple-mobile-web-app-capable`, `apple-touch-icon`, safe-area insets).
- Files: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, `icons/`. Bump a `CACHE_VERSION` const in `sw.js` on every change.

## Data model
```json
{
  "settings": { "currency": "đ", "monthlyBudget": 4500000, "paymentMethods": ["Cash","Bank","Card"] },
  "categories": [{ "id":"health","name":"Health","color":"#b98a86","icon":"health" }],
  "expenses": [{ "id":"uuid","title":"Long châu","amount":503000,"categoryId":"health",
                 "method":"Cash","date":"2026-11-01","note":"" }]
}
```
- Amounts are integers in VND. Dates are `YYYY-MM-DD` in local time (never `toISOString()` for dates — it shifts the day in UTC+7).
- Default categories (name · color): Health `#b98a86`, Shopping `#a3b18a`, Food & Drink `#c9a66b`, Groceries `#84a99c`, Transport `#9a98c4`, plus Bills, Other. User can add/rename/delete in Settings.
- Support both expense and income? **No** — expenses only unless the user asks.

## Cloud sync (optional, Supabase)
Offline-first stays the default: the app writes to `localStorage` first and never blocks on the network. When the user signs in, Supabase becomes the source of truth and `localStorage` is the cache.

- Tables: `expenses`, `categories`, `settings`; every row carries `user_id`, `updated_at`, `deleted` (soft delete).
- Auth: Supabase email magic link; add Sign in with Apple if offered.
- Security: RLS on every table (`user_id = auth.uid()`). The anon key is safe in the client; never ship the `service_role` key.
- Client: plain `fetch` to PostgREST/Auth, or `supabase-js` from a CDN — no build step.
- Sync: push rows marked pending, pull rows with a newer `updated_at`; last-write-wins on conflict.
- Offline queue: every mutation works offline and is retried when the connection returns.
- First sign-in: ask Merge or Replace before uploading local data.
- Settings: show signed-in email, "Last synced", Sync now, Sign out.
- Keep Export/Import JSON as the manual backup for when the account is lost.

## Formatting
- VND display: `đ` prefix, dot thousands separator, no decimals → `đ2.168.000`. Use `new Intl.NumberFormat('vi-VN').format(n)` and prepend `đ`.
- Amount input: numeric keypad (`inputmode="numeric"`), live-format with dots while typing, parse by stripping non-digits.
- Shortcut: typing `50k` → 50.000, `1.5m` → 1.500.000.

## Screens (match the reference screenshots)
Bottom floating pill tab bar with 4 tabs: **Overview · History · Analytics · Settings**, plus a round FAB `+` (bottom-right, above the bar) that opens the Add sheet.

### 1. Overview
- Header: `‹  November 2026  ›` month switcher. When the hero card scrolls out of view, the header shows `November 2026 · đ2.168.000`.
- Hero card (large radius ~28px): small label "Spent this month", huge centered amount in display font, "N expenses" below, then inner dark pill split in two: **Yesterday** (amount or "No spending") | **Today**.
- Budget card: "Budget" left, `spent · budget` right, thin rounded progress bar, "đX left" below. Bar turns from marble → gold → rust at 80% / 100%. Tap to edit the budget.
- Categories card: one row per category with icon, name, amount, chevron, and a thin colored bar scaled to the top category (or to total). Tap → History filtered by that category and month. Sort by amount desc, hide zero rows.
- Recent card: last 5 expenses (icon tile, title, `Category · Today/Yesterday/dd MMM`, amount right) and an "All" link → History.

### 2. History
- Title "History", rounded search field ("Titles, notes, and categories"), filter chips: **Date ▾ · Category ▾ · Payment Method ▾** (bottom-sheet pickers; active chip filled gold).
- Grouped by day: group header `Today` / `Yesterday` / `Sat, 31 Oct` with the day total on the right; rows in a card with hairline dividers.
- Tap row → edit sheet. Swipe-left or button in the sheet → delete with confirm. Show an Undo toast after deleting.

### 3. Analytics
Keep it light:
- Month total vs previous month (± %).
- Donut by category (SVG, same category colors) with legend.
- Bar chart of the last 6 months.
- Daily average and the top 3 biggest expenses this month.

### 4. Settings
- Monthly budget, currency symbol, categories (add / edit color+icon / delete), payment methods.
- **Export JSON** and **Import JSON** (manual backup — still needed with cloud sync, because the account can be lost and iOS can evict the local cache).
- Export CSV (UTF-8 with BOM so Excel opens Vietnamese correctly).
- Clear all data (double confirm).

### Add / Edit sheet (bottom sheet)
Fields in this order: Amount (autofocus, big) → Title → Category (horizontal chips with icons) → Payment method → Date (defaults to today) → Note. One primary "Save" button. Saving must take ≤ 3 taps for the common case (amount, category, save). Remember the last used category and payment method.

## Greek god visual language
Dark marble at night, gold leaf accents. Calm, monumental, uncluttered.

**Palette (CSS variables)**
```css
:root{
  --bg:#1f2220;          /* basalt */
  --card:#2a2d2a;        /* dark marble */
  --card-2:#1a1c1a;      /* inset pill */
  --line:#3a3d39;
  --text:#f1ece1;        /* marble white */
  --muted:#9a9b92;
  --gold:#c9a45c;        /* primary accent */
  --gold-soft:#e3cf9a;
  --rust:#b5654f;        /* over budget */
  --radius:28px;
}
```
- Keep the muted category colors from the screenshots; use gold only for accents (active tab text/ring, active chips, FAB icon ring, progress bar fill when 80–100%, links).
- Background: flat `--bg` with a very faint marble-vein noise (inline SVG feTurbulence, opacity ≤ 0.04). Never busy.

**Type**
- Display / headings / big amounts: `Cinzel` (Google Fonts) — falls back to `"Trajan Pro", Georgia, serif`. Numbers in the hero use Cinzel at ~64px.
- Body / lists: `Inter` or system-ui, 16–17px. Self-host or cache the fonts in the service worker so they work offline.
- Small labels: uppercase, letter-spacing .08em, `--muted`.

**Ornament (subtle, 3 places max)**
1. A thin Greek-key (meander) divider under the hero card and above the Settings sections — done with an SVG `background-image` repeating pattern, gold at 25% opacity, 10px tall.
2. A small laurel-wreath SVG around the app icon/splash and next to the Overview title when under budget.
3. Tab bar active pill gets a hairline gold border; the FAB is marble white with a gold `+`.
- Copy sprinkles (one-liners, optional, in Settings → "Tone" default on): empty state "The oracle sees no spending."; under budget "The gods smile upon your purse."; over budget "Hubris. The budget is breached." Keep UI labels themselves plain English as in the screenshots.
- Icons: simple 24px stroke/fill SVG set (health briefcase, shopping bag, fork&knife, cart, bus, receipt, ellipsis). Inline them; no icon font.

**Motion**: 150–250ms ease-out fades/slides, progress bars animate width, sheets slide up. Respect `prefers-reduced-motion`.

**App icon**: rounded square, basalt bg, gold laurel wreath around a gold drachma "đ" (or a simple column). Generate PNG 192/512/maskable via a small script (e.g. node `canvas` or a one-off HTML canvas export) — don't ask the user to design it.

## Implementation rules
- Single `state` object + `render()` per screen; re-render on change; save to `localStorage` on every mutation (debounced 100ms is fine) and mark the record pending for sync.
- Hash routing (`#/overview`, `#/history`, `#/analytics`, `#/settings`) so the back button works inside the installed PWA.
- Mobile-first, max-width 480px centered on desktop. Use `env(safe-area-inset-*)` for the tab bar and FAB. Min tap target 44px.
- Dark only (matches reference). No light theme unless asked.
- Accessible enough: real `<button>`s, labels on inputs, contrast ≥ 4.5:1 for text.
- Vietnamese text must work everywhere (`lang="vi"` on `<html>` is fine even with English UI; search should be diacritic-insensitive: normalize with `str.normalize('NFD').replace(/\p{M}/gu,'')` and lowercase, `đ→d`).
- No analytics. Network calls only to the optional Google Fonts and, when signed in, Supabase; cache the app shell so the UI loads without network.

## iPhone / iOS Safari specifics (primary target — must follow)
The user runs this on an iPhone. iOS PWAs have quirks; handle all of these.

**Install & hosting**
- Must be served over **HTTPS** (service worker won't register otherwise). `http://192.168.x.x` from the phone does not work for PWA testing → host on GitHub Pages / Netlify / Cloudflare Pages.
- No install prompt on iOS. Show a one-time hint banner when `!navigator.standalone` and UA is iOS: "Tap Share → Add to Home Screen". Hide it once running standalone.
- localStorage inside the installed app is **separate** from Safari's. Tell the user: install first, enter data after. Data typed in a Safari tab will not carry over. With cloud sync, signing in rebuilds the cache from Supabase.

**Head / meta**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Olympus Finance">
<meta name="theme-color" content="#1f2220">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png"> <!-- 180x180 -->
<meta name="color-scheme" content="dark">
```
- iOS ignores manifest icons for the home screen: ship a **180×180 opaque PNG** `apple-touch-icon` (no transparency, no pre-rounded corners — iOS rounds it).
- With `black-translucent` the page draws under the status bar: add `padding-top: env(safe-area-inset-top)` to the header and `padding-bottom: env(safe-area-inset-bottom)` to the tab bar/FAB. Body bg must be `--bg` so overscroll isn't white.

**Layout & input**
- Use `100dvh`, never `100vh` (Safari toolbar jumps).
- All `input/select/textarea` `font-size: 16px` minimum, otherwise iOS auto-zooms on focus.
- `touch-action: manipulation` on buttons (kills double-tap zoom), `-webkit-tap-highlight-color: transparent`, `-webkit-user-select: none` on UI chrome (keep selectable for notes), `overscroll-behavior-y: none` on the app shell, `-webkit-overflow-scrolling: touch` on scroll containers.
- Add sheet: keep Amount field visible above the keyboard — scroll it into view on focus and size the sheet with `visualViewport.height`. Amount input `inputmode="numeric"` (shows the number pad; no decimal key needed for VND).
- `<input type="date">` works natively on iOS; add `color-scheme: dark` so the picker is dark.
- Don't rely on `navigator.vibrate` (unsupported on iOS). Skip haptics.
- Swipe-to-delete must not conflict with the iOS edge-swipe back gesture: only start swipe from row content, ≥ 24px away from the left edge; also provide a Delete button in the edit sheet.

**Storage safety**
- Call `navigator.storage?.persist?.()` on first launch (best effort; iOS may ignore it).
- iOS can still purge PWA data under storage pressure or if the app is deleted → backups are mandatory, not optional:
  - Settings shows "Last backup: <date>" and a gold warning chip if > 14 days.
  - On the 1st of each month (first open), prompt "Export backup?".

**Export / import on iOS** (blob `<a download>` is unreliable in standalone mode)
- Export: use Web Share with a file so the user can "Save to Files" / AirDrop / send to Zalo:
  ```js
  const file = new File([json], `thuchi-${ymd}.json`, {type:'application/json'});
  if (navigator.canShare?.({files:[file]})) await navigator.share({files:[file]});
  else { /* fallback: open blob URL in a new tab */ }
  ```
  Same for CSV.
- Import: `<input type="file" accept="application/json,.json">` (opens Files picker). Validate schema + version, show a summary ("Found 214 expenses") and ask Replace vs Merge before applying.

**Service worker updates**
- iOS caches the shell aggressively. In `sw.js`: `self.skipWaiting()` on install, `clients.claim()` on activate, delete old caches by `CACHE_VERSION`. Show a small "Update ready — tap to reload" toast when a new SW is waiting. Tell the user: if an update doesn't show, swipe the app away in the app switcher and reopen.
- Precache fonts and icons so the first offline launch doesn't flash fallback fonts.

**Splash screen (optional polish)**: without `apple-touch-startup-image` iOS shows a blank screen briefly; with `background_color: #1f2220` and a dark `--bg` it's acceptable, so don't generate per-device splash images unless asked.

## Build steps
1. Create the file tree and the manifest (`display: "standalone"`, `background_color`/`theme_color` = `#1f2220`, `start_url: "./"`, `scope: "./"` so it works under a GitHub Pages sub-path — use relative URLs everywhere).
2. Write CSS variables, layout, tab bar, cards, sheets.
3. Write the data layer (load/save/migrate by `version`, seed default categories).
4. Build Overview → Add sheet → History → Settings → Analytics, in that order, testing each.
5. Add the service worker and icons.
6. Seed a few sample expenses behind a "Load demo data" button in Settings (not on by default).
7. Test with a local server (`python3 -m http.server`) and Lighthouse PWA checks; verify offline mode and the day boundary around 23:59 / 00:00.

## Deliver
- Give the user the folder (zip) and these hosting options, simplest first: **GitHub Pages**, **Netlify/Cloudflare Pages drag-and-drop**, or run locally.
- Tell them how to install (iPhone first): Safari → open the HTTPS link → Share → Add to Home Screen → open from the new icon, then start entering data. (Android Chrome → Install app.)
- Remind them: signed out, data lives only on that phone; signed in, Supabase holds it but the local cache can still be purged → keep using Settings → Export JSON (Share sheet to Files/iCloud).
- Keep the final message to a few lines; don't recap every file.

## Out of scope unless asked
Income tracking, multi-currency, recurring expenses, receipts/OCR, shared budgets, in-app purchases. Cloud sync and login are opt-in via Supabase, not the default.
