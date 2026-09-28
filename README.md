# Bluebird Weather 🐦🕶️

A beachy, bird-branded weather app for **Boca Raton, FL** (home of FAU), built on the free [Open-Meteo](https://open-meteo.com/) API — no signup, no API key required.

## Features

- Defaults to Boca Raton, FL on load
- Search any city worldwide (via Open-Meteo's geocoding API)
- "Use my location" button (browser geolocation)
- Current conditions, 24-hour hourly forecast, and 7-day forecast
- Beige / white / pastel-blue theme with a sunglasses-wearing bluebird logo

## Tech

Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies, no backend. It's just static files, which makes it a perfect fit for Netlify.

```
index.html
css/style.css
js/app.js
assets/logo.svg
netlify.toml
```

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Deploy to Netlify

**Option A — Netlify UI (drag & drop)**

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole project folder onto the page
3. Netlify gives you a live URL immediately

**Option B — Connect this Git repo (recommended, auto-deploys on push)**

1. Push this repo to GitHub (already done if you're reading this from the repo)
2. In Netlify: **Add new site → Import an existing project**
3. Pick this repository
4. Build settings (already configured via `netlify.toml`):
   - **Build command:** (leave empty)
   - **Publish directory:** `.`
5. Click **Deploy site**

**Option C — Netlify CLI**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

No environment variables or secrets are needed — Open-Meteo's endpoints are public and CORS-enabled for direct browser calls.

## Attribution

Weather and geocoding data © [Open-Meteo.com](https://open-meteo.com/), licensed under Attribution 4.0 (CC BY 4.0).
