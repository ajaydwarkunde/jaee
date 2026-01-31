# Build stage
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src

# Build the application
RUN gradle build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar
COPY --from=build /app/build/libs/jaee-backend-1.0.0.jar app.jar

# Render provides PORT env variable - default to 8080
ENV PORT=8080

# JVM options for free tier (limited memory) and better error logging
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Expose port
EXPOSE ${PORT}

# Run the application with the PORT from environment
CMD java ${JAVA_OPTS} -Dserver.port=${PORT} -Dspring.profiles.active=prod -jar app.jar
