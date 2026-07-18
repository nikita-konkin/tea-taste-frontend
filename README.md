# tea-taste-frontend

Frontend of the **Tea Taste** app (`teaform.ru`) — a React SPA for keeping structured tea-tasting notes. Built with Create React App, MUI, react-hook-form, and react-router. Talks to [`tea-taste-api`](../tea-taste-api) using cookie-based JWT auth (`credentials: 'include'`).

## Structure

```
src/
├── components/
│   ├── App.jsx               # Routing, auth state, protected routes
│   ├── Login / Registration  # Auth pages
│   ├── TeaFormStage1/2.jsx   # Multi-stage tasting form (tea data → brewings/aromas/tastes)
│   ├── MyFormInteraction.jsx # Viewing/editing saved sessions
│   ├── Forms.jsx / Form.jsx  # Session lists
│   ├── Profile.jsx, Blog.jsx, Navigation.jsx, Popup*.jsx, …
├── utils/
│   ├── MainAPI.jsx           # Auth endpoints (sign-up/in/out, profile)
│   └── FormAPI.jsx           # Tea data endpoints (forms, brewings, aromas, tastes)
└── blocks/, images/, sounds/ # Styles and assets
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `REACT_APP_API_URL` | `/api` | Base URL of the backend API. A CRA **build-time** variable — changing it requires a rebuild. |

The default `/api` assumes the app is served behind a proxy that routes `/api/` to the backend (this is how production works — the outer nginx proxies `teaform.ru/api/` to `tea-backend:3001/`). For local development against a directly exposed API, set an absolute URL.

## Run locally (dev server)

```bash
npm install --legacy-peer-deps    # @mui/x-date-pickers@7 has a peer conflict with @mui/material@5
echo "REACT_APP_API_URL='http://localhost:3001'" > .env
npm start        # http://localhost:3000
```

The backend must allow this origin: include `http://localhost:3000` in its `ALLOWED_CORS`. The easiest way to get a backend + MongoDB running is the sandbox in [`../sandbox`](../sandbox) (it exposes the API on `localhost:3001` and already allows this origin).

Other scripts: `npm run build` (production build to `build/`), `npm test` (jest via react-scripts).

## Docker / production

The Dockerfile is multi-stage: CRA production build → `nginx:alpine` serving the static files with an SPA fallback (`nginx/default.conf`). The API URL is baked in via a build arg:

```bash
docker compose up -d --build     # uses REACT_APP_API_URL=https://teaform.ru/api
# or manually:
docker build --build-arg REACT_APP_API_URL=/api -t tea-frontend .
```

The container's nginx serves static files only; API routing is the outer proxy's job. TLS also terminates at the outer nginx (`/etc/letsencrypt` is mounted there).
