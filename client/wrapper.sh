#!/bin/sh
"$@" &
pid=$!
while read line ; do
  :
done
# The script may be waiting on child processes that it spawned,
# so we make sure to kill these as well (otherwise the init process
# takes ownership of the child processes and they keep running)
pkill -KILL -P $pid
kill -KILL $pid
