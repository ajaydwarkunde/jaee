#!/usr/bin/env bash
# Render native Java start script
# Set this as the start command in Render dashboard

exec java \
  -Xmx256m -Xms128m \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:+TieredCompilation \
  -XX:TieredStopAtLevel=1 \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.profiles.active=prod \
  -Dserver.port=$PORT \
  -jar build/libs/jaee-backend-1.0.0.jar
