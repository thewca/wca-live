#!/usr/bin/env bash

set -e
cd "$(dirname "$0")/../.."

source ./bin/utils.sh
load_dotenv

docker run -it --rm postgres psql "$DATABASE_URL"
