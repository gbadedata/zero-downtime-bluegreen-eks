# ============================================================
# terraform.tfvars
# Your actual values. Edit here, not in variables.tf.
# Do NOT commit this file if it ever contains secrets.
# ============================================================

aws_region         = "us-east-1"
project_name       = "bluegreen"
cluster_name       = "bluegreen-cluster"
kubernetes_version = "1.31"
vpc_cidr           = "10.0.0.0/16"
az_count           = 2
node_instance_type = "t3.medium"
node_count         = 2
ecr_repo_name      = "bluegreen-app"

common_tags = {
  Project     = "bluegreen-deployment"
  Environment = "demo"
  ManagedBy   = "terraform"
  Owner       = "gbadedata"
  GitHub      = "github.com/gbadedata/zero-downtime-bluegreen-eks"
}
