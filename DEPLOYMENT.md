# DocuMind Deployment Guide

Deploy to **Netlify (Frontend)** and **Fly.io (Backend)**

## Prerequisites

- Git account (GitHub, GitLab, or Bitbucket)
- Netlify account (free at netlify.com)
- Fly.io account (free at fly.io)
- Git CLI installed
- Fly CLI installed (`flyctl`)

---

## 🚀 STEP 1: Prepare for Deployment

### 1.1 Update `.env` with Production Values

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://vxewpgphqjsyocaiykbd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.2 Commit Changes

```bash
git add .
git commit -m "feat: add deployment configs for Netlify and Fly.io"
git push origin main
```

---

## 📦 STEP 2: Deploy Backend to Fly.io

### 2.1 Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### 2.2 Login to Fly.io

```bash
flyctl auth login
```

### 2.3 Create Fly.io App and Deploy

```bash
cd d:\DocuMind
flyctl launch --name documind-backend
```

When prompted:

- **Dockerfile**: Choose existing `backend/Dockerfile`
- **PostgreSQL**: Reply `y` if you want Fly.io to provision DB (optional, you're using local Postgres)
- **Redis**: Reply `n` unless needed
- **Deploy now?**: Reply `n` for now

### 2.4 Set Environment Variables for Fly.io

```bash
flyctl secrets set ALLOWED_ORIGINS="https://documind.netlify.app,http://localhost:8080"
flyctl secrets set SUPABASE_URL="https://vxewpgphqjsyocaiykbd.supabase.co"
flyctl secrets set SUPABASE_KEY="your-supabase-key"
# Add any other backend env vars
```

### 2.5 Deploy

```bash
flyctl deploy
```

Your backend will be live at: **https://documind-backend.fly.dev**

---

## 🎨 STEP 3: Deploy Frontend to Netlify

### 3.1 Push to GitHub (if not already)

```bash
git push origin main
```

### 3.2 Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub account
3. Click **"New site from Git"**
4. Select your GitHub repo (`DocuMind`)
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables:
   ```
   VITE_SUPABASE_URL = https://vxewpgphqjsyocaiykbd.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   VITE_API_BASE_URL = https://documind-backend.fly.dev/api
   ```
7. Click **"Deploy site"**

Your frontend will be live at a URL like: **https://documind.netlify.app**

---

## 🔗 STEP 4: Update Supabase OAuth Redirect URIs

Since your frontend is now on a production domain, update Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add redirect URIs:
   ```
   https://documind.netlify.app/auth/callback
   https://documind.netlify.app/workspace
   ```
3. Save

---

## ✅ STEP 5: Final Testing

1. Visit **https://documind.netlify.app**
2. Click **"Login with Google"** or **"Login with Microsoft"**
3. Verify you can authenticate
4. Check browser console for any errors
5. Test document upload/processing

---

## 📝 Troubleshooting

### Frontend won't load

- Check **Netlify Deploy Logs**: Site settings → Netlify Live Logs
- Verify environment variables are set in Netlify
- Clear browser cache (Ctrl+Shift+Delete)

### Backend API errors

- Check **Fly.io Logs**:
  ```bash
  flyctl logs
  ```
- Verify CORS in backend:
  ```bash
  flyctl secrets get ALLOWED_ORIGINS
  ```
- Update with:
  ```bash
  flyctl secrets set ALLOWED_ORIGINS="https://documind.netlify.app,http://localhost:8080"
  ```

### Authentication issues

- Verify Supabase redirect URIs match your Netlify domain
- Check Azure Tenant ID is correctly set (should be `74bd8477-4533-4172-b082-1b39af165a6d`)

### Database issues

- Ensure PostgreSQL is running (locally or via Fly.io)
- Check connection string in backend `.env`

---

## 🎉 Deployment Complete!

Your app is now live at:

- **Frontend**: https://documind.netlify.app
- **Backend**: https://documind-backend.fly.dev

---

## 💰 Cost Estimate (Free/Cheap)

- **Netlify**: Free (100GB bandwidth/month)
- **Fly.io**: Free tier (3 shared CPUs, includes small DB)
- **Supabase**: Free tier (500MB DB)
- **Total**: $0/month ✨
