# Deployment Guide

This project is ready for both Render and Vercel workflows.

## Option 1: Render (recommended for full-stack app)

1. Push the repository to GitHub.
2. Open Render and create a new Web Service.
3. Connect the repository.
4. Use these settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Root Directory: `.`
5. Add environment variables:
   - `PORT=5000`
   - `AUTH_SECRET=<long random secret>`
   - `OWNER_NAME=ZID Gym Owner`
   - `OWNER_EMAIL=owner@yourdomain.com`
   - `OWNER_PASSWORD=StrongPassword123!`
6. Deploy.

Notes:
- The Express server serves the built frontend as static files when `dist/` exists.
- The app keeps a local JSON fallback for demo scenarios when the backend is unavailable.

## Option 2: Vercel (static frontend)

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Optional: for a static demo only, the site works as a polished landing page with local fallback data.

For a real full-stack production deployment, Render is the stronger option because the app includes an Express API.

## Production checklist

- Replace placeholder owner credentials in `.env`
- Set a secure `AUTH_SECRET`
- Replace contact details with the client brand info
- Add real analytics, domain, tracking, and SEO files
- If using a custom domain, update `og:` tags and sitemap values
