variable "region" {
  type    = string
  default = "ap-southeast-2"
}

variable "allowed_origins" {
  description = "Origins of the local website, allowed to upload video straight to the media bucket."
  type        = list(string)
  default     = ["http://localhost:5173"]
}
