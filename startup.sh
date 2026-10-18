#!/bin/sh
# Revive preview + Sumi API. Idempotent: start only what is down.
export JAVA_HOME=/workspace/.tools/jdk-21
export PATH="$JAVA_HOME/bin:/workspace/.tools/apache-maven-3.9.11/bin:$PATH"

if ! curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8082/api/health; then
  if [ -f /workspace/backend/target/sumi-api.jar ]; then
    cd /workspace/backend
    java -jar target/sumi-api.jar >>/tmp/sumi-api.log 2>&1 &
    cd /workspace
  fi
fi

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace
npm run dev >>/tmp/app-startup.log 2>&1 &
