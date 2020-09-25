#!/bin/bash

set -e
cd "$(dirname "$0")/../.."

docker-compose exec server bin/wca_live remote
