#!/bin/bash

set -e
cd "$(dirname "$0")/.."

docker run --rm --env-file .env thewca/wca-live bin/wca_live eval 'WcaLive.Release.migrate()'
