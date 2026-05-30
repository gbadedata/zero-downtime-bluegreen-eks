# ============================================================
# variables.tf
# All configurable values in one place.
# Override any of these in terraform.tfvars.
# ============================================================

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix all resources"
  type        = string
  default     = "bluegreen"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "bluegreen-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.31"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to use (and public subnets to create)"
  type        = number
  default     = 2
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes"
  type        = string
  default     = "t3.medium"
}

variable "node_count" {
  description = "Number of worker nodes in the EKS node group"
  type        = number
  default     = 2
}

variable "ecr_repo_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "bluegreen-app"
}

variable "common_tags" {
  description = "Tags applied to every AWS resource"
  type        = map(string)
  default = {
    Project     = "bluegreen-deployment"
    Environment = "demo"
    ManagedBy   = "terraform"
    Owner       = "gbadedata"
  }
}
