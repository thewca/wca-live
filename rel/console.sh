#!/bin/sh
set -euo pipefail

# This script connects to one of the running ECS tasks and opens an
# interactive Elixir shell attached directly to the running system.
#
# In the shell, you can invoke Elixir functions, including the ones
# defined in the application. A few examples follow.
#
# Importing a competition:
#
#     user = WcaLive.Accounts.get_user(1) # Jonatan Kłosko
#     WcaLive.Synchronization.import_competition("WCACompetitionID2030", user)
#
# Synchronizing a competition:
#
#     user = WcaLive.Accounts.get_user(1) # Jonatan Kłosko
#     competition = WcaLive.Competitions.get_competition(123456)
#     WcaLive.Synchronization.synchronize_competition(competition, user)
#
# Running an SQL query:
#
#     result = WcaLive.Repo.query!("select count(*) from competitions")
#
# Again, keep in mind that the code executes directly within the running
# application.
#
# Once you are finish, exit the shell by pressing Ctrl + C twice.

export AWS_DEFAULT_PROFILE=wca

task_arn="$(
  aws ecs list-tasks \
    --region us-west-2 \
    --cluster wca-live \
    --service-name wca-live-web \
    --query "taskArns[0]" \
    --output text
)"

aws ecs execute-command  \
  --region us-west-2 \
  --cluster wca-live \
  --task $task_arn \
  --container web \
  --command "/app/bin/wca_live remote" \
  --interactive
