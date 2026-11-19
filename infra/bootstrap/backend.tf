# The state bucket is created by this root, so the FIRST apply must run with
# local state:
#
#   mv backend.tf backend.tf.off
#   tofu init && tofu apply
#   BUCKET=$(tofu output -raw state_bucket)
#   mv backend.tf.off backend.tf
#   tofu init -migrate-state \
#     -backend-config=bucket=$BUCKET \
#     -backend-config=key=bootstrap.tfstate \
#     -backend-config=region=ap-southeast-2
#   rm terraform.tfstate terraform.tfstate.backup   # after checking the remote copy
#
# Never commit a local terraform.tfstate.

terraform {
  backend "s3" {
    encrypt      = true
    use_lockfile = true
  }
}
