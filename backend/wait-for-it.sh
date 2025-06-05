#!/bin/sh

host="$1"
shift

# If next argument is "--", skip it
if [ "$1" = "--" ]; then
  shift
fi

cmd="$@"

until nc -z "$host" 5432; do
  echo "Waiting for $host:5432..."
  sleep 1
done

echo "$host is ready!"
exec $cmd
