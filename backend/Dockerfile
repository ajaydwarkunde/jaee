# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# LAYER 1: Copy Gradle wrapper + build config (changes rarely)
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle gradle.properties* ./
RUN chmod +x gradlew

# LAYER 2: Download dependencies (cached if build files don't change)
RUN ./gradlew dependencies --no-daemon -q 2>/dev/null || true

# LAYER 3: Copy source code (changes frequently)
COPY src ./src

# LAYER 4: Build the application (uses cached dependencies)
RUN ./gradlew bootJar --no-daemon -q -x test

# Extract layers for optimal runtime caching
FROM eclipse-temurin:21-jdk-alpine AS extract
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Runtime stage - minimal image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=extract --chown=appuser:appgroup /app/dependencies/ ./
COPY --from=extract --chown=appuser:appgroup /app/spring-boot-loader/ ./
COPY --from=extract --chown=appuser:appgroup /app/snapshot-dependencies/ ./
COPY --from=extract --chown=appuser:appgroup /app/application/ ./

USER appuser

ENV PORT=8080
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

CMD java ${JAVA_OPTS} -Dserver.port=${PORT} -Dspring.profiles.active=prod org.springframework.boot.loader.launch.JarLauncher
