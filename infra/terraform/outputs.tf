output "cloud_run_url" {
  description = "The deployed URL of Haq AI on Google Cloud Run"
  value       = google_cloud_run_v2_service.haq_ai_service.uri
}

output "storage_bucket" {
  description = "Document storage bucket name"
  value       = google_storage_bucket.uploads_bucket.name
}

output "service_account_email" {
  description = "Service account running Haq AI"
  value       = google_service_account.haq_ai_sa.email
}

output "artifact_registry_repo" {
  description = "Artifact Registry Docker repository"
  value       = google_artifact_registry_repository.haq_ai_repo.name
}
