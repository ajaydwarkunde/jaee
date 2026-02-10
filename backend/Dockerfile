# ============================================
# OPTIMIZED DOCKERFILE FOR RENDER (LAYER CACHING)
# ============================================
# Strategy: Maximize Docker layer caching since Render 
# doesn't support BuildKit persistent caches

# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Install gradle (lightweight approach)
RUN apk add --no-cache curl unzip && \
    curl -sL https://services.gradle.org/distributions/gradle-8.5-bin.zip -o gradle.zip && \
    unzip -q gradle.zip && \
    rm gradle.zip && \
    mv gradle-8.5 /opt/gradle

ENV GRADLE_HOME=/opt/gradle
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

# LAYER 1: Copy ONLY build config files (changes rarely)
COPY build.gradle settings.gradle gradle.properties* ./

# LAYER 2: Download dependencies (cached if build files don't change)
# This is the key optimization - dependencies are cached in this layer
RUN gradle dependencies --no-daemon -q 2>/dev/null || true && \
    gradle build --no-daemon -q -x bootJar -x test 2>/dev/null || true

# LAYER 3: Copy source code (changes frequently)
COPY src ./src

# LAYER 4: Build the application (uses cached dependencies)
RUN gradle bootJar --no-daemon -q -x test

# ============================================
# Extract layers for optimal runtime caching
# ============================================
FROM eclipse-temurin:21-jdk-alpine AS extract
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# ============================================
# Runtime stage - minimal image
# ============================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy Spring Boot layers in order of change frequency
# (dependencies change least, application changes most)
COPY --from=extract --chown=appuser:appgroup /app/dependencies/ ./
COPY --from=extract --chown=appuser:appgroup /app/spring-boot-loader/ ./
COPY --from=extract --chown=appuser:appgroup /app/snapshot-dependencies/ ./
COPY --from=extract --chown=appuser:appgroup /app/application/ ./

USER appuser

# Render provides PORT env variable
ENV PORT=8080

# Optimized JVM flags for container + fast startup
ENV JAVA_OPTS="-Xmx256m -Xms128m \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseG1GC \
    -XX:+TieredCompilation \
    -XX:TieredStopAtLevel=1 \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.backgroundpreinitializer.ignore=true"

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT}/actuator/health || exit 1

# Use Spring Boot layered launch for faster startup
CMD java ${JAVA_OPTS} -Dserver.port=${PORT} -Dspring.profiles.active=prod org.springframework.boot.loader.launch.JarLauncher
