# ============================================
# OPTIMIZED DOCKERFILE FOR FASTER BUILDS
# ============================================

# Build stage - cache dependencies separately
FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /app

# Copy only dependency-related files first (for better caching)
COPY build.gradle settings.gradle ./
COPY gradle.properties* ./

# Download dependencies (this layer gets cached if dependencies don't change)
RUN gradle dependencies --no-daemon || true

# Now copy source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN gradle build -x test --no-daemon --parallel --build-cache

# ============================================
# Runtime stage - minimal image
# ============================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy the built jar
COPY --from=build /app/build/libs/jaee-backend-1.0.0.jar app.jar

# Set ownership
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Render provides PORT env variable - default to 8080
ENV PORT=8080

# Optimized JVM settings for containers
ENV JAVA_OPTS="-Xmx256m -Xms128m \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.backgroundpreinitializer.ignore=true"

EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT}/actuator/health || exit 1

# Run the application
CMD java ${JAVA_OPTS} -Dserver.port=${PORT} -Dspring.profiles.active=prod -jar app.jar
