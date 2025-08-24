provider "aws" {
  region = "us-east-1"
}

# Security issue: Publicly accessible S3 bucket
resource "aws_s3_bucket" "bad_bucket" {
  bucket = "vuln-terraform-demo-bucket"
  acl    = "public-read"   # <-- BAD: world-readable bucket

  tags = {
    Name        = "vuln-demo-bucket"
    Environment = "dev"
  }
}

# Security issue: Security group with open ingress
resource "aws_security_group" "bad_sg" {
  name        = "vuln-sg"
  description = "Allow all inbound traffic (insecure)"
  vpc_id      = "vpc-123456" # <-- Replace with dummy/test VPC id

  ingress {
    description = "ALL open inbound"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # <-- BAD: world-open
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
