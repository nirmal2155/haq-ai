#!/usr/bin/env bash
# ==============================================================================
# Haq AI — Cloud Run Deployment Script
# Startup Buildathon India 2026
# ==============================================================================
set -euo pipefail

# Configuration
SERVICE_NAME="${SERVICE_NAME:-haq-ai}"
REGION="${GCP_REGION:-asia-south1}" # Default Mumbai region
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo '')}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-haq-ai-runner@${PROJECT_ID}.iam.gserviceaccount.com}"

if [ -z "${PROJECT_ID}" ]; then
  echo "ERROR: GCP_PROJECT_ID is not set and could not be detected from gcloud config."
  echo "Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "=========================================================="
echo " Deploying Haq AI to Google Cloud Run"
echo " Project:         ${PROJECT_ID}"
echo " Region:          ${REGION}"
echo " Service:         ${SERVICE_NAME}"
echo " Service Account: ${SERVICE_ACCOUNT}"
echo "=========================================================="

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "ERROR: Google Cloud SDK (gcloud) is not installed."
  exit 1
fi

# Deploy using source-based build with Cloud Build & Cloud Run
# Secrets mounted safely from Google Secret Manager — NO secrets in command or image
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --source="." \
  --service-account="${SERVICE_ACCOUNT}" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=60s \
  --set-env-vars="NODE_ENV=production,GEMINI_MODEL=gemini-2.0-flash,GEMINI_LIVE_MODEL=gemini-2.0-flash-exp" \
  --set-secrets="\
GEMINI_API_KEY=GEMINI_API_KEY:latest,\
FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,\
FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,\
FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,\
FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET:latest"

echo "=========================================================="
echo " Deployment Complete! Testing /api/health endpoint..."
echo "=========================================================="

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --region="${REGION}" --project="${PROJECT_ID}" --format='value(status.url)')
echo "Live URL: ${SERVICE_URL}"

# Health Check Smoke Test
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/api/health" || echo "000")

if [ "${HEALTH_CODE}" -eq 200 ]; then
  echo "✓ Smoke Test Passed: /api/health returned 200 OK"
else
  echo "⚠ Warning: /api/health returned HTTP ${HEALTH_CODE}. Inspect Cloud Run logs for details."
fi
