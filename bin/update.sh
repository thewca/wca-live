#!/bin/bash

set -e
cd "$(dirname "$0")/.."

echo "# Pulling latest Git repository from GitHub"
# Reset the prod branch to match the remote state
git fetch
git reset --hard origin/prod

echo "# Pulling latest Docker images from DockerHub"
docker compose pull

echo "# Running migrations"
# Migrate using the new image, before restarting the app
./bin/migrate.sh

echo "# Restarting the app"
./bin/up.sh
