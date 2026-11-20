# Haq AI — Infrastructure & Deployment

Target Deployment: **Google Cloud Run (Mumbai / `asia-south1`)** with **Google Secret Manager** and **Cloud Build**.

## Security Architecture
- Non-root container runtime (`nextjs:nodejs` user UID 1001).
- No secrets stored in git or environment files; all secrets pulled dynamically from Google Secret Manager.
- Ephemeral tokens generated for Gemini 2.0 Live WebSockets.
- Least-privilege IAM service account `haq-ai-runtime@...` bound strictly to Cloud Storage bucket and Firestore.

## Files
- `cloudrun-service.yaml`: Cloud Run service definition with liveness/startup probes pointing to `/api/healthz`.
- `cloudbuild.yaml`: Automated CI/CD pipeline executing `typecheck`, `vitest`, Docker build, and deployment.
