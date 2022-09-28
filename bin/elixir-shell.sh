#!/bin/bash

set -e
cd "$(dirname "$0")/.."

docker compose exec app bin/wca_live remote
