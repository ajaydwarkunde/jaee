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

# Expose port
EXPOSE ${PORT}

# Run the application with the PORT from environment
# Using shell form to expand $PORT variable
CMD java -Dserver.port=${PORT} -jar app.jar
