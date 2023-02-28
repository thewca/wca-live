# Infrastructure

The infrastructure for running WCA Live.

## Setup

First, install terraform and initialize with:

```
terraform init
terraform workspace select prod || terraform workspace new prod
```

To apply changes run:

```
terraform apply -var-file prod.tfvars
```

Note that you also need the `prod.tfvars` file with configuration and secrets.

## Details

WCA Live is encapsulated in a single Docker image (with packaged Elixir release inside). Most of the time a single container is enough, however we also have autoscaling in place that may spawn more containers. Each container runs a single node (Erlang distribution) and has its own IP that is registered in a private DNS by ECS. In case multiple containers are running the nodes form a cluster by querying the DNS and discovering peer IPs (using the `libcluster` library).

### App

We use ECS to run the app container(s). We use EC2 capacity provider instead of Fargate, because:

  1. At the time of writing EC2 vCPU is significantly cheaper:

     * EC2 (2 vCPU + 1 GB) ~ 0.0104$/h
     * Fargate (1 vCPU + 1 GB) ~ 0.0449$/h

  2. The app workload is fairly burstable (entering a result results in broadcasting the update to all listening clients). Fargate doesn't support bursting at the moment (https://github.com/aws/containers-roadmap/issues/163) and overprovisioning would be costy. With EC2 overprovisioning is less of a concern, which gives the app a fair amount of vCPU for bursts.

We use ECS Service Auto Scaling to spawn more app tasks when CPU usage crosses certain threshold. To run the tasks we use EC2 Auto Scaling Group that is automatically managed by ECS (Cluster Auto Scaling).

We configure task resource requirements to guarantee only one task per EC2 instance, which is optimal in our case (we want to give the Erlang node all resources to manage on its own). The only downside of this is that during Blue/Green deployment we need to spawn a new EC2 instance for the new task, which makes for an additional delay, but it is a fair trade off in our case.

### Deployment

To automate deployment we use a CodePipeline that is triggered by pushing a new app image to ECR. The pipeline:

  1. Sources the new ECR image arn.
  2. Prepares files necessary for CodeDeploy (`appspec.yaml`, `taskdef.json`)
  3. Runs the migration task.
  4. Triggers CodeDeploy that does Blue/Green deployment.

## References

An arbitrary set of useful resources:

  * [Example infrastructure (no distribution, no autoscaling)](https://github.com/newaperio/revista/tree/main/infra)
  * [Terraform VPC](https://spacelift.io/blog/terraform-aws-vpc)
  * [Discussion on Erlang distribution on ECS](https://elixirforum.com/t/distributed-elixir-in-amazon-ecs/15106)
  * [CodePipeline and CodeDeploy](https://medium.com/@kay.renfa/aws-ecs-bluegreen-codepipeline-with-private-git-repository-9268a3a65da6)
  * [CodePipeline migration](https://medium.com/@alfred_/running-database-migrations-with-codepipeline-and-ecs-68b195476833)
  * [Tips on ECS deployment](https://www.qovery.com/blog/how-to-speed-up-amazon-ecs-container-deployments)
  * [Secrets management](https://blog.gruntwork.io/a-comprehensive-guide-to-managing-secrets-in-your-terraform-code-1d586955ace1)
