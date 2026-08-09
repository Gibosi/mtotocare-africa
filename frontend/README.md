# MtotoCare Web Admin

React 18 + Vite 5 + Tailwind 3 web admin portal for healthcare workers and administrators.

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev
# Open http://localhost:5173
```

Default login:
- **Email:** `admin@mtotocare.africa`
- **Password:** `Admin123!`

## Build for production

```bash
npm run build
# Output in dist/ — deploy to Netlify, Vercel, Render Static Site, or any static host
```

Set `VITE_API_URL` to point to your backend:
```bash
VITE_API_URL=https://mtotocare-backend.onrender.com/api npm run build
```

## Pages

| Path | Role | Purpose |
|---|---|---|
| `/login` | public | Login + language toggle (EN/SW) |
| `/forgot-password` | public | Send reset email |
| `/reset-password?token=...` | public | Set new password |
| `/admin` | ADMIN | Admin dashboard with stats |
| `/admin/users` | ADMIN | Manage users (CRUD + roles) |
| `/admin/facilities` | ADMIN | Manage facilities |
| `/admin/audit` | ADMIN | Audit log |
| `/admin/profile` | ADMIN | Edit own profile |
| `/provider` | PROVIDER | Provider dashboard |
| `/provider/patients` | PROVIDER | My patients |
| `/provider/patients/:id` | PROVIDER | Patient detail |
| `/provider/appointments` | PROVIDER | My appointments |

## Features

- **Auto-detect backend URL** — works with localhost, Render, anywhere
- **EN/SW language toggle** in top right of every page
- **JWT auth** with auto-refresh on 401
- **Sidebar nav** with role-based menu items
- **Responsive** layout (mobile-friendly)

## Tech

- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Axios 1.7.7
- Recharts 2.10 (for charts)
- Custom lightweight i18n (no external dep)
