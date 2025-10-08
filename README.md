# Blood Group Info (CEP)

This repository contains a static frontend and a small Flask backend that provides blood group details.

Why you may see "Error connecting to server" on GitHub Pages
- GitHub Pages serves static files only. It cannot run the Flask backend.
- The frontend originally calls `http://127.0.0.1:5000/api/bloodinfo`, which works locally but fails on GitHub Pages.

What I changed
- `script.js` now uses an `API_BASE_URL` variable. By default it is empty so it will call `/api/bloodinfo` on the same origin. If you host the backend under the same domain (or set up a proxy), set `API_BASE_URL` accordingly.
- `script.js` also includes a client-side fallback dataset so the site works fully static (useful when publishing to GitHub Pages).

How to run locally (recommended for full experience)
1. Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install flask flask-cors
```

2. Run the backend:

```bash
python3 app.py
```

3. Serve the frontend (you can open `index.html` directly in your browser or use a simple HTTP server):

```bash
# from the repository root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Deploying backend for production
- Host `app.py` on a platform that runs Python (Heroku, Render, Railway, Fly, etc.) and set `API_BASE_URL` in `script.js` to the backend URL.
- Alternatively, keep the frontend and backend under the same domain and ensure your server serves both static files and API endpoints.

If you want, I can:
- Add a small script to toggle `API_BASE_URL` via an environment-specific build step.
- Provide deployment steps for a specific hosting provider.
