variable "env" {
  type        = string
  description = "Environment name"
  default     = "prod"
}

variable "name_prefix" {
  type        = string
  description = "Prefix for naming resources"
  default     = "wca-live"
}

variable "region" {
  type        = string
  description = "The region to operate in"
  default     = "us-west-2"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones"
  default     = ["us-west-2a", "us-west-2b"]
}

variable "secret_key_base" {
  type        = string
  description = "The secert key base for the application"
  sensitive   = true
}

variable "db_username" {
  type        = string
  description = "Username for the database"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "Password for the database"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "Name of the database"
  sensitive   = true
}

variable "host" {
  type        = string
  description = "The host for generating absolute URLs in the application"
  default     = "live.worldcubeassociation.org"
}

variable "wca_host" {
  type        = string
  description = "The host for generating absolute URLs in the application"
  default     = "worldcubeassociation.org"
}

variable "wca_oauth_client_id" {
  type        = string
  description = "The host for generating absolute URLs in the application"
  sensitive   = true
}

variable "wca_oauth_client_secret" {
  type        = string
  description = "The host for generating absolute URLs in the application"
  sensitive   = true
}
