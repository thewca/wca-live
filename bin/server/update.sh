#!/bin/bash

set -e
cd "$(dirname "$0")/.."

echo "# Pulling latest Git repository from GitHub"
git pull

echo "# Pulling latest Docker images from DockerHub"
docker-compose pull

./bin/server/up.sh
