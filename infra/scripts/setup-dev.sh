#!/bin/bash

# Jaee Development Environment Setup Script
echo "🌸 Setting up Jaee development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL database..."
docker-compose -f infra/docker-compose.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

echo "✅ Database is ready!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy backend/.env.example to backend/.env and update values"
echo "  2. Run backend: cd backend && ./mvnw spring-boot:run"
echo "  3. Copy frontend/.env.example to frontend/.env"
echo "  4. Run frontend: cd frontend && npm install && npm run dev"
echo ""
echo "🔗 URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo "  Swagger:  http://localhost:8080/swagger-ui.html"
echo ""
echo "🌸 Happy coding!"
