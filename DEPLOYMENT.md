# ClubAtlas Firebase Deployment Guide

Deployment configuration using Firebase: **Frontend (Next.js)** on Firebase App Hosting, **Backend (FastAPI)** on Google Cloud Run, **Firestore/Storage rules** deployed via Firebase CLI.

---

## 1. Prerequisites

- Node.js 18+
- Python 3.10+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools` then `firebase login`
- Google Cloud project = Firebase project (use the same project)

---

## 2. Firebase Project Setup

1. Create or select a project in [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → Enable email/password
3. Create **Firestore Database**
4. Enable **Storage**
5. Set project ID in **.firebaserc**:
   ```json
   {"projects":{"default":"your-actual-project-id"}}
   ```
   (Replace `your-project-id` with the project ID from Firebase Console)

---

## 3. Deploy Firestore & Storage Rules

You can deploy rules independently from frontend/backend deployment.

```bash
firebase deploy --only firestore,storage
```

---

## 4. Frontend (Next.js) — Firebase App Hosting

Firebase App Hosting supports Next.js (including SSR).

1. [Firebase Console](https://console.firebase.google.com) → Project → **Build** → **App Hosting**
2. **Get started** → Connect GitHub repository → Select ClubAtlas repository
3. **Root directory**: Repository root (or directory containing Next.js app)
4. **Framework preset**: Next.js
5. Add the following to **Environment variables**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_API_URL` = **Deployed backend URL** (e.g., `https://your-api-xxxx.run.app`)
6. After building, it auto-deploys and a host URL is assigned.

If not using App Hosting (static only): build Next.js with `output: 'export'` and deploy the `out` directory to **Firebase Hosting**. This project has dynamic routes (`/student/home/clubs/[id]`), so App Hosting is recommended.

---

## 5. Backend (FastAPI) — Google Cloud Run

The backend is deployed to **Cloud Run**, not Firebase. Use the same Google Cloud project.

### 5.1 Build and Push Docker Image

From project root:

```bash
cd backend
docker build -t gcr.io/your-actual-project-id/clubatlas-api .
docker push gcr.io/your-actual-project-id/clubatlas-api
```

(If using **Artifact Registry**, use the region path instead of `gcr.io`, e.g., `europe-west1-docker.pkg.dev/...`)

### 5.2 Create Cloud Run Service

- **Console**: Cloud Run → Create Service → Select image → Grant Firestore and other permissions to service account
- **gcloud** example:
  ```bash
  gcloud run deploy clubatlas-api \
    --image gcr.io/your-actual-project-id/clubatlas-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
  ```

### 5.3 Environment Variables (Cloud Run)

Set the following in **Environment variables** for the Cloud Run service.

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | `private_key` from service account JSON (keep `\n` for line breaks) |
| `FIREBASE_CLIENT_EMAIL` | Service account `client_email` |
| `FIREBASE_CLIENT_ID` | (optional) `client_id` |
| `FIREBASE_PRIVATE_KEY_ID` | (optional) `private_key_id` |
| `FIREBASE_CLIENT_X509_CERT_URL` | (optional) `client_x509_cert_url` |
| `ALLOWED_ORIGINS` | Frontend URL (App Hosting URL), e.g., `https://your-app.web.app,https://your-app.firebaseapp.com` |

Service account key can be obtained from Firebase Console → Project Settings → Service Accounts → Generate New Private Key.

---

## 6. Post-Deployment Verification

1. **Frontend**: Access App Hosting URL → Verify login, club list, recommendations, etc. https://clubatlasbackend--clubatlas-ecaa4.us-east4.hosted.app/
2. **Backend**: Call `https://deployed-api-url/health` → Verify `{"status":"healthy"}` response
   Service URL: https://clubatlas-api-1027306571468.us-central1.run.app
3. **CORS**: Verify API calls from browser are not blocked (add actual frontend domain to `ALLOWED_ORIGINS` if needed)

---

## 7. Summary

| Component | Deploy Target | Method |
|-----------|--------------|--------|
| Firestore rules, indexes | Firebase | `firebase deploy --only firestore` |
| Storage rules | Firebase | `firebase deploy --only storage` |
| Next.js app | Firebase App Hosting | Connect GitHub in Console, auto build/deploy |
| FastAPI backend | Cloud Run | Docker build then `gcloud run deploy` |

Before production: change SuperAdmin password, secure API keys/service account keys, review CORS and Firestore rules.
