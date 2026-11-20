variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
  default     = "haq-ai-production"
}

variable "region" {
  description = "The primary Google Cloud region"
  type        = string
  default     = "asia-south1" # Mumbai for lowest latency to Indian MSMEs
}

variable "environment" {
  description = "Deployment environment (production, staging)"
  type        = string
  default     = "production"
}

variable "app_image" {
  description = "Artifact Registry container image URI for Haq AI"
  type        = string
  default     = "asia-south1-docker.pkg.dev/haq-ai-production/haq-ai-repo/haq-ai-app:latest"
}

variable "min_instances" {
  description = "Minimum instances for Cloud Run autoscaling (prevents cold starts)"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum instances for Cloud Run autoscaling"
  type        = number
  default     = 10
}
