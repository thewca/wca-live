#!/bin/bash

set -e
cd "$(dirname "$0")/../.."

echo "# Pulling latest Git repository from GitHub"
# Reset the prod branch to match the remote state.
git fetch
git reset --hard origin/prod

echo "# Pulling latest Docker images from DockerHub"
docker-compose pull

./bin/server/up.sh
