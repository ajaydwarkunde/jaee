#!/usr/bin/env bash
# Render native Java build script
# Set this as the build command in Render dashboard

set -e

echo "Building Spring Boot application..."
./gradlew bootJar -x test --no-daemon

echo "Build complete!"
ls -la build/libs/
