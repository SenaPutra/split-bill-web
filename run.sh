#!/bin/bash

# Define app name and port
APP_NAME="split-bill-web"
PORT="7771"

echo "🚀 Starting deployment for $APP_NAME..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker first."
  exit 1
fi

# Stop existing containers if any
echo "🛑 Stopping existing containers..."
docker compose down

# Build and start the container
echo "🏗️  Building and starting container on port $PORT..."
docker compose up -d --build

# Show status
if [ $? -eq 0 ]; then
  echo "✅ Application is properly running!"
  echo "👉 Open http://localhost:$PORT to view it."
  docker compose ps
else
  echo "❌ Failed to start the application."
fi
