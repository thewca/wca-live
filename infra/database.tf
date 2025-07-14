resource "aws_security_group" "database" {
  name        = "${var.name_prefix}-database"
  description = "Production main security group for the database"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
    description     = "Ingress from the cluster"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All egress"
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name_prefix}-database"
  }
}

resource "aws_db_subnet_group" "this" {
  name        = "${var.name_prefix}-database"
  description = "Production main subnet group for the database"
  subnet_ids  = aws_subnet.private[*].id
}

resource "aws_db_parameter_group" "this" {
  name   = var.name_prefix
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_instance" "this" {
  identifier        = var.name_prefix
  allocated_storage = 20
  storage_type      = "gp2"
  instance_class    = "db.t4g.medium"

  engine                      = "postgres"
  engine_version              = "16.8"
  auto_minor_version_upgrade  = true
  db_name                     = var.db_name
  username                    = var.db_username
  password                    = var.db_password
  parameter_group_name        = aws_db_parameter_group.this.name
  allow_major_version_upgrade = true
  apply_immediately           = true

  availability_zone      = var.availability_zones[0]
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.database.id]

  # Set this to create the database from a specific snapshot
  # snapshot_identifier = "<snapshot_id>"

  skip_final_snapshot = true

  lifecycle {
    # TODO: make this based on var.env once possible (https://github.com/hashicorp/terraform/issues/22544)
    prevent_destroy = true
  }
}
