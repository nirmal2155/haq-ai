terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Google Cloud Services Enablement
locals {
  services = [
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudtasks.googleapis.com",
    "cloudscheduler.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
  ]
}

resource "google_project_service" "enabled_services" {
  for_each           = toset(locals.services)
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# 2. Artifact Registry for Container Images
resource "google_artifact_registry_repository" "haq_ai_repo" {
  depends_on    = [google_project_service.enabled_services]
  location      = var.region
  repository_id = "haq-ai-repo"
  description   = "Docker repository for Haq AI Cloud Run container images"
  format        = "DOCKER"
}

# 3. Dedicated Service Account with Least Privilege
resource "google_service_account" "haq_ai_sa" {
  account_id   = "haq-ai-app-sa"
  display_name = "Haq AI Production Application Service Account"
  description  = "Runs the Cloud Run application with least privilege access"
}

# 4. Storage Bucket for Document Uploads (PDF, JPEG, PNG, WEBP)
resource "google_storage_bucket" "uploads_bucket" {
  depends_on                  = [google_project_service.enabled_services]
  name                        = "haq-ai-uploads-${var.project_id}"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 90 # 90-day retention for compliance unless archived
    }
  }

  cors {
    origin          = ["https://haqai.in", "https://*.haqai.in"]
    method          = ["GET", "PUT", "POST", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Grant Service Account access to uploads bucket
resource "google_storage_bucket_iam_member" "sa_storage_admin" {
  bucket = google_storage_bucket.uploads_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.haq_ai_sa.email}"
}

# 5. Secret Manager for Secure Keys
locals {
  secret_names = [
    "gemini-api-key",
    "firebase-service-account",
    "email-webhook-secret",
    "session-secret",
  ]
}

resource "google_secret_manager_secret" "app_secrets" {
  for_each  = toset(locals.secret_names)
  secret_id = each.key

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "sa_secret_access" {
  for_each  = toset(locals.secret_names)
  secret_id = google_secret_manager_secret.app_secrets[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.haq_ai_sa.email}"
}

# 6. Cloud Tasks Queue for Reminder & Ingest Background Dispatch
resource "google_cloud_tasks_queue" "reminder_queue" {
  depends_on = [google_project_service.enabled_services]
  name       = "reminder-dispatch-queue"
  location   = var.region

  rate_limits {
    max_dispatches_per_second = 10
    max_concurrent_dispatches = 5
  }

  retry_config {
    max_attempts       = 5
    min_backoff        = "1s"
    max_backoff        = "60s"
    max_doublings      = 4
    max_retry_duration = "3600s"
  }
}

# 7. Cloud Run Service (Haq AI Next.js Application)
resource "google_cloud_run_v2_service" "haq_ai_service" {
  depends_on = [
    google_project_service.enabled_services,
    google_secret_manager_secret_iam_member.sa_secret_access,
  ]
  name     = "haq-ai-app"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.haq_ai_sa.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.app_image

      resources {
        limits = {
          cpu    = "2000m"
          memory = "2048Mi"
        }
      }

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "NEXT_PUBLIC_APP_URL"
        value = "https://haqai.in"
      }
      env {
        name  = "STORAGE_BUCKET_NAME"
        value = google_storage_bucket.uploads_bucket.name
      }
      env {
        name  = "CLOUD_TASKS_QUEUE"
        value = google_cloud_tasks_queue.reminder_queue.id
      }

      # Secrets mounted from Secret Manager
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_secrets["gemini-api-key"].secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "EMAIL_WEBHOOK_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_secrets["email-webhook-secret"].secret_id
            version = "latest"
          }
        }
      }

      liveness_probe {
        http_get {
          path = "/api/healthz"
          port = 3000
        }
        initial_delay_seconds = 10
        period_seconds        = 15
        timeout_seconds       = 5
        failure_threshold     = 3
      }

      startup_probe {
        http_get {
          path = "/api/readyz"
          port = 3000
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        timeout_seconds       = 3
        failure_threshold     = 5
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Allow public unauthenticated invocation (Next.js web app)
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.haq_ai_service.location
  service  = google_cloud_run_v2_service.haq_ai_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 8. Cloud Scheduler for Automated Reminders Check
resource "google_cloud_scheduler_job" "daily_reminders_trigger" {
  depends_on  = [google_project_service.enabled_services]
  name        = "haq-ai-daily-reminders-job"
  description = "Triggers daily reminder evaluations at 09:00 IST (03:30 UTC)"
  schedule    = "30 3 * * *"
  time_zone   = "Asia/Kolkata"

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.haq_ai_service.uri}/api/scheduler/check-reminders"

    oidc_token {
      service_account_email = google_service_account.haq_ai_sa.email
    }
  }
}
