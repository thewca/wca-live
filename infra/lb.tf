resource "aws_security_group" "lb" {
  name        = "${var.name_prefix}-load-balancer"
  description = "Production load balancer"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP"
  }

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    ipv6_cidr_blocks = ["::/0"]
    description      = "Allow HTTP IPV6"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS"
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    ipv6_cidr_blocks = ["::/0"]
    description      = "Allow HTTPS IPV6"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all egress"
  }

  tags = {
    Name = "${var.name_prefix}-load-balancer"
  }
}

resource "aws_lb" "this" {
  name               = var.name_prefix
  internal           = false
  load_balancer_type = "application"
  security_groups    = ["${aws_security_group.lb.id}"]
  subnets            = aws_subnet.public[*].id
  ip_address_type    = "ipv4"

  # Note that we use WebSocket connections, but they send heartbeat every 30s
  idle_timeout = 60
}

resource "aws_lb_target_group" "this" {
  # Blue/Green
  count = 2

  name        = "${var.name_prefix}-${count.index}"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id
  target_type = "ip"

  # WebSocket connections are long-lived, so we want to deregister
  # the target more eagerly than the default 5 minutes
  deregistration_delay = 30

  health_check {
    interval            = 10
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = 200
  }
}

# TODO: for wca-live we want HTTPS listener and attach a certificate

resource "aws_lb_listener" "this" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.this[0].arn
    type             = "forward"
  }

  lifecycle {
    # The target group changes during Blue/Green deployment
    ignore_changes = [default_action]
  }

  tags = {
    Name = var.name_prefix
  }
}
