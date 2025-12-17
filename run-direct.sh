#!/bin/bash

# Configuration
IMAGE_NAME="split-bill-web-image"
CONTAINER_NAME="split-bill-web-container"
PORT="7771"

echo "🚀 Starting deployment using pure Docker..."

# 1. Stop and remove existing container if it exists
# 1. Stop and remove existing container if it exists
# Check for this script's container
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping and removing existing container ($CONTAINER_NAME)..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check for Docker Compose container (common conflict)
if [ "$(docker ps -aq -f name=split-bill-web-web-1)" ]; then
    echo "🛑 Stopping existing Docker Compose container..."
    docker stop split-bill-web-web-1
    docker rm split-bill-web-web-1
fi

# 2. Build the Docker image
echo "🏗️  Building Docker image ($IMAGE_NAME)..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# 3. Run the container
echo "▶️  Running container ($CONTAINER_NAME) on port $PORT..."
docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME

# 4. Success message
if [ $? -eq 0 ]; then
    echo "✅ App is running!"
    echo "👉 Access it at http://localhost:$PORT"
else
    echo "❌ Failed to run container."
fi
