resource "aws_security_group" "cluster" {
  name        = "${var.name_prefix}-cluster"
  description = "Production ECS cluster"
  vpc_id      = aws_vpc.this.id

  tags = {
    Name = "${var.name_prefix}-cluster"
  }
}

# Note: we use the standalone SG rules (rather than inline), becuase
# cluster_cluster_ingress references the SG itself

resource "aws_security_group_rule" "cluster_lb_ingress" {
  type                     = "ingress"
  security_group_id        = aws_security_group.cluster.id
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  source_security_group_id = aws_security_group.lb.id
  description              = "Load balancer ingress"
}

resource "aws_security_group_rule" "cluster_cluster_ingress" {
  type                     = "ingress"
  security_group_id        = aws_security_group.cluster.id
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  source_security_group_id = aws_security_group.cluster.id
  description              = "Allow ingress from other members of the cluster"
}

resource "aws_security_group_rule" "cluster_all_egress" {
  type              = "egress"
  security_group_id = aws_security_group.cluster.id
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow all egress"
}


resource "aws_cloudwatch_log_group" "this" {
  name = var.name_prefix
}

resource "aws_ecs_cluster" "this" {
  name = var.name_prefix
}

locals {
  app_environment = [
    {
      name  = "CLUSTER_DNS_QUERY"
      value = "cluster.local"
    },
    {
      name  = "DATABASE_URL"
      value = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:${aws_db_instance.this.port}/${var.db_name}"
    },
    {
      name  = "SECRET_KEY_BASE"
      value = "${var.secret_key_base}"
    },
    {
      name  = "HOST"
      value = "${var.host}"
    },
    {
      name  = "WCA_HOST"
      value = "${var.wca_host}"
    },
    {
      name  = "WCA_OAUTH_CLIENT_ID"
      value = "${var.wca_oauth_client_id}"
    },
    {
      name  = "WCA_OAUTH_CLIENT_SECRET"
      value = "${var.wca_oauth_client_secret}"
    },
    {
      name  = "NEW_RELIC_APP_NAME"
      value = "${var.new_relic_app_name}"
    },
    {
      name  = "NEW_RELIC_LICENSE_KEY"
      value = "${var.new_relic_license_key}"
    }
  ]
}

resource "aws_ecs_task_definition" "migrate" {
  family = "${var.name_prefix}-migrate"

  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]

  cpu    = 512
  memory = 512

  container_definitions = jsonencode([
    {
      name         = "web"
      image        = "${aws_ecr_repository.this.repository_url}:latest"
      command      = ["/app/bin/migrate"]
      portMappings = []
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.this.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "${var.name_prefix}"
        }
      }
      environment = local.app_environment
    }
  ])

  tags = {
    Name = "${var.name_prefix}-migrate"
  }
}

data "aws_iam_policy_document" "task_assume_role_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "task_execution_role" {
  name               = "${var.name_prefix}-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "task_execution_role_attachment" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task_role" {
  name               = "${var.name_prefix}-task-role"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role_policy.json
}

data "aws_iam_policy_document" "task_policy" {
  statement {
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "task_policy" {
  role   = aws_iam_role.task_role.name
  policy = data.aws_iam_policy_document.task_policy.json
}

resource "aws_ecs_task_definition" "web" {
  family = var.name_prefix

  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]

  # We configure the roles to allow `aws ecs execute-command` into a task,
  # as in https://aws.amazon.com/blogs/containers/new-using-amazon-ecs-exec-access-your-containers-fargate-ec2
  execution_role_arn = aws_iam_role.task_execution_role.arn
  task_role_arn      = aws_iam_role.task_role.arn

  # We intentionally don't specify neither CPU nor memory limits to
  # let the task use all available resources. We only specify a memory
  # soft limit (memoryReservation) for the container, which is requried
  # in this case and it also ensures we only run a single web task per
  # EC2 instance.

  container_definitions = jsonencode([
    {
      name              = "web"
      image             = "${aws_ecr_repository.this.repository_url}:latest"
      memoryReservation = 1536
      portMappings = [
        {
          # The hostPort is automatically set for awsvpc network mode,
          # see https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html#ECS-Type-PortMapping-hostPort
          containerPort = 4000
          protocol      = "tcp"
        },
        {
          # Erlang distribution port
          containerPort = 9000
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.this.name}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "${var.name_prefix}"
        }
      }
      environment = local.app_environment
    }
  ])

  tags = {
    Name = "${var.name_prefix}-web"
  }
}

resource "aws_service_discovery_private_dns_namespace" "this" {
  name = "local"
  vpc  = aws_vpc.this.id
}

resource "aws_service_discovery_service" "this" {
  name = "cluster"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.this.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }
}

data "aws_ecs_task_definition" "web" {
  task_definition = aws_ecs_task_definition.web.family
}

resource "aws_ecs_service" "web" {
  name    = "${var.name_prefix}-web"
  cluster = aws_ecs_cluster.this.id
  # During deployment a new task revision is created with modified
  # container image, so we want use data.aws_ecs_task_definition to
  # always point to the active task definition
  task_definition                    = data.aws_ecs_task_definition.web.arn
  desired_count                      = 1
  scheduling_strategy                = "REPLICA"
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 50
  health_check_grace_period_seconds  = 0

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.this.name
    weight            = 1
  }

  enable_execute_command = true

  ordered_placement_strategy {
    type  = "spread"
    field = "attribute:ecs.availability-zone"
  }

  ordered_placement_strategy {
    type  = "spread"
    field = "instanceId"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.this[0].arn
    container_name   = "web"
    container_port   = 4000
  }

  network_configuration {
    security_groups = [aws_security_group.cluster.id]
    subnets         = aws_subnet.private[*].id
  }

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  service_registries {
    registry_arn = aws_service_discovery_service.this.arn
  }

  tags = {
    Name = "${var.name_prefix}-web"
  }

  lifecycle {
    ignore_changes = [
      # The desired count is modified by Application Auto Scaling
      desired_count,
      # The target group changes during Blue/Green deployment
      load_balancer,
    ]
  }

  depends_on = [aws_lb_listener.https, aws_lb_listener.http]
}

resource "aws_appautoscaling_target" "this" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.web.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 25
}

resource "aws_appautoscaling_policy" "this" {
  name               = var.name_prefix
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.this.resource_id
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension
  service_namespace  = aws_appautoscaling_target.this.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 60
  }

  depends_on = [aws_appautoscaling_target.this]
}

data "aws_ami" "ecs" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-*"]
  }
}

data "aws_iam_policy_document" "ecs_instance_assume_role_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_instance_role" {
  name               = "${var.name_prefix}-ecs-instance-role"
  description        = "Allows ECS instances to call AWS services"
  assume_role_policy = data.aws_iam_policy_document.ecs_instance_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_attachment" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.name_prefix}-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

resource "aws_launch_configuration" "this" {
  name_prefix          = "${var.name_prefix}-"
  image_id             = data.aws_ami.ecs.id
  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name
  instance_type        = "t3.small"
  security_groups      = [aws_security_group.cluster.id]
  user_data            = templatefile("templates/user_data.sh.tftpl", { ecs_cluster_name = aws_ecs_cluster.this.name })


  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "this" {
  name_prefix               = "${var.name_prefix}-"
  min_size                  = 1
  max_size                  = 25
  desired_capacity          = 1
  vpc_zone_identifier       = aws_subnet.private[*].id
  launch_configuration      = aws_launch_configuration.this.name
  health_check_grace_period = 0
  health_check_type         = "EC2"
  default_cooldown          = 300

  # Necessary when using managed termination provider on capacity provider
  protect_from_scale_in = true

  # Note: this tag is automatically added when adding ECS Capacity Provider
  # to the ASG and we need to reflect it in the config
  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = var.name_prefix
    propagate_at_launch = true
  }

  tag {
    key                 = "Description"
    value               = "Assigned to ${aws_ecs_cluster.this.name} ECS cluster, managed by ASG"
    propagate_at_launch = true
  }

  tag {
    key                 = "Env"
    value               = var.env
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true

    # The desired count is modified by Application Auto Scaling
    ignore_changes = [desired_capacity]
  }
}

resource "aws_ecs_capacity_provider" "this" {
  name = var.name_prefix

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.this.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      # Allow ECS to spawn the desired number of EC2 instances at once
      maximum_scaling_step_size = 100
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = [aws_ecs_capacity_provider.this.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.this.name
    weight            = 1
  }
}
