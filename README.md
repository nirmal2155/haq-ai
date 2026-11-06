# Haq AI — Statutory MSME Payment Rights & Sec 43B(h) Tracker
### Startup Buildathon India 2026 · Antigravity Build Pack

Haq AI empowers Indian micro and small enterprises (MSMEs) to enforce statutory payment rights under Sections 15 & 16 of the MSMED Act, 2006 (15/45-day statutory deadline, 3× RBI compound interest) and exposes Section 43B(h) tax risks for corporate buyers.

> **Statutory Disclaimer:** Haq AI is a drafting and decision-support tool, not legal advice. Every generated document carries the visible notice: *"Draft only. Review with a CA/lawyer before sending."*

---

## Architecture & Technology Stack
- **Full-Stack Framework:** Next.js 14 App Router + TypeScript (Strict mode) + TailwindCSS
- **Deterministic Math Engine:** Pure functions using `decimal.js` (integer paise storage, zero floating point inaccuracies)
- **AI Vision & Live Assistant:** Google GenAI SDK (`@google/genai`) on server-side only. Browser connects via short-lived ephemeral tokens.
- **Authentication & Database:** Firebase Auth (Google Sign-In) + Cloud Firestore (Admin SDK on server)
- **Storage:** Private Cloud Storage bucket with magic bytes verification & 5-minute signed URLs
- **Deployment:** Google Cloud Run (Dockerfile multi-stage, non-root user, Secret Manager integration)
- **Testing:** Vitest + Zod schema validation

---

## Step-by-Step Setup Guide

### 1. Manual Steps in Google Cloud Console
1. **Create or Select Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (e.g. `haq-ai-india-2026`).
2. **Enable Required APIs:**
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     cloudbuild.googleapis.com \
     firestore.googleapis.com \
     storage.googleapis.com \
     aiplatform.googleapis.com
   ```
3. **Configure Firestore:**
   - Open **Firestore** in Console -> Create database -> Choose **Native Mode** -> Region `asia-south1` (Mumbai).
4. **Create Private Cloud Storage Bucket:**
   - Create bucket: `gs://YOUR_PROJECT_ID-haq-private`
   - Access control: **Uniform bucket-level access** (Public access prevention enforced).
5. **Create Least-Privilege Service Account:**
   ```bash
   gcloud iam service-accounts create haq-ai-runner \
     --description="Service account for Haq AI Cloud Run" \
     --display-name="haq-ai-runner"

   # Grant minimal required roles:
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:haq-ai-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/datastore.user"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:haq-ai-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.objectAdmin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:haq-ai-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```
6. **Populate Secrets in Secret Manager:**
   ```bash
   gcloud secrets create GEMINI_API_KEY --data-file=- <<< "your_gemini_api_key"
   gcloud secrets create FIREBASE_PROJECT_ID --data-file=- <<< "YOUR_PROJECT_ID"
   gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=- <<< "firebase-adminsdk@..."
   gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- <<< "-----BEGIN PRIVATE KEY-----..."
   gcloud secrets create FIREBASE_STORAGE_BUCKET --data-file=- <<< "YOUR_PROJECT_ID-haq-private"
   ```

---

## Local Development & Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run All Unit & Security Tests:**
   ```bash
   npm test
   ```

3. **Run TypeScript Check & ESLint:**
   ```bash
   npm run typecheck
   npm run lint
   ```

4. **Seed Demo Data (3 Suppliers, 2 Buyers, 8 Invoices):**
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## Cloud Run Deployment

Run the production deployment script:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Smoke Test:
Verify the live service health:
```bash
curl https://YOUR_SERVICE_URL/api/health
# Returns: {"status":"ok","service":"haq-ai", ...}
```
