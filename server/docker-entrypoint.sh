#!/bin/sh

if [ "$1" = "start" ]; then
  bin/wca_live start
elif [ "$1" = "migrate" ]; then
  bin/wca_live eval 'WcaLive.Release.migrate()'
else
  bin/wca_live $1
fi
