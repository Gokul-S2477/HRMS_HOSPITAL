## Copilot / Agent instructions for HRMS_HOSPITAL

Purpose: give an AI coding assistant the exact, practical knowledge to be productive here.

- Project layout: backend (Django REST) and frontend (React CRA).

- Quick start (discoverable from files):
  - **Backend**: run from `backend/` using Django CLI: `python manage.py runserver`.
    - Key files: `backend/manage.py`, `backend/backend/settings.py` (DB, CORS, JWT).
    - Common tasks: `makemigrations`, `migrate`, `createsuperuser`, `test` via `manage.py`.
  - **Frontend**: run from `frontend/`: `npm install` then `npm start` (CRA).
    - Key files: `frontend/package.json` (scripts), `frontend/src/index.tsx` (app bootstrap), `frontend/src/environment.ts` (base paths).

- Big-picture architecture (what to know):
  - Backend is a multi-app Django project. Each app maps to a domain (e.g., `employees`, `attendance`, `payroll`, `users`). Models live in each app's `models.py`, serializers in `serializers.py`, and URL routes in `urls.py`.
  - REST API: DRF is installed and configured in `backend/backend/settings.py`. JWT auth provided by `rest_framework_simplejwt`. API endpoints are mounted under `/api/` in `backend/backend/urls.py` (e.g., `users.auth_urls`, `employees.urls`).
  - Frontend is a Create React App + TypeScript project using React Router and Redux. Routes live under `frontend/src/feature-module/router/`, store at `frontend/src/core/data/redux/store`.

- Important conventions and patterns (project-specific):
  - App-per-domain layout: expect each Django app to contain its own `models.py`, `serializers.py`, `views.py`, `urls.py`, and `migrations/`.
  - Auth: custom user model `users.CustomUser` (see `backend/backend/settings.py`). JWT routes are in `users` app; search `users/auth_urls.py` for token endpoints.
  - CORS is permissive in dev: `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py` — frontend dev on port 3000 is expected to call backend APIs.
  - Frontend base paths: `frontend/src/environment.ts` defines `base_path` and `img_path` — use these when building routes or static references.

- Integration points & external dependencies to be careful about:
  - DB config uses `dj_database_url` + `.env`. Look at `DATABASE_URL` env var; fallback to SQLite is present.
  - The backend relies on `rest_framework`, `rest_framework_simplejwt`, `corsheaders`. Ensure these packages are present in your Python environment before running the server.
  - Frontend has many UI libraries (Ant Design, FullCalendar, PrimeReact). Local dev expects `npm install` to succeed before `npm start`.

- Where to look for examples / entry points:
  - React app entry: `frontend/src/index.tsx` — shows provider, router, and the `feature-module` routing.
  - API mounting: `backend/backend/urls.py` — includes `users.auth_urls`, `employees.urls`, `attendance.urls`, `payroll.urls`, etc.
  - Shared assets: `backend/assets/` and `frontend/public/assets/`.

- Developer workflow notes (explicit commands):
  - Backend (from repo root): `cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1; python -m pip install -r requirements.txt` (if a requirements file exists), then `python manage.py runserver`.
  - Run migrations: `python manage.py makemigrations` then `python manage.py migrate`.
  - Frontend: `cd frontend; npm ci` (or `npm install`); `npm start`; `npm run build` for production.
  - Tests: `cd backend; python manage.py test` and `cd frontend; npm test`.

- Typical code-change patterns the agent should follow here:
  - When adding an API endpoint, add `serializers.py` (if missing), add views (prefer viewsets when appropriate), and register `urls.py` in the app and ensure it's included in `backend/backend/urls.py` under the `/api/` prefix.
  - When changing or adding a model, create migrations (`makemigrations`) and include the new migration file under that app's `migrations/` directory.
  - Frontend route changes: update `frontend/src/feature-module/router/router` and add any feature components under `feature-module`.

- Search tips for the agent (explicit grep/scan targets):
  - Find API endpoints: search for `path(` inside `backend/*/urls.py` and `include('*.urls')` inside `backend/backend/urls.py`.
  - Find custom user/auth: `AUTH_USER_MODEL` in `backend/backend/settings.py` and token routes in `users/auth_urls.py`.
  - Find axios/fetch helpers: search `axios` or `create` in `frontend/src` (look in `frontend/src/api/`).

- Safety & assumptions: do not assume production secrets are stored in repository — `settings.py` reads from environment and `.env`. Avoid committing secrets and point maintainers to `.env` patterns.

If anything here is unclear or you want different emphasis (tests, CI, or release steps), tell me which sections to expand or adjust.
