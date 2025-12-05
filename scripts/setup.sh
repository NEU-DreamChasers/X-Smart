#!/usr/bin/env bash
# Setup script for Unix-like systems
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== X-Smart setup (Unix) ==="

echo "Installing backend dependencies..."
cd backend
npm install
cd "$ROOT_DIR"

if [ -d "frontend" ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd "$ROOT_DIR"
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Copying .env.example -> .env"
  cp .env.example .env
fi

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  echo "Copying backend/.env.example -> backend/.env"
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then
  echo "Copying frontend/.env.example -> frontend/.env"
  cp frontend/.env.example frontend/.env
fi

echo "Starting docker-compose (build)" 
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build
else
  echo "docker-compose not found in PATH. Please install Docker Compose or use 'docker compose'."
  exit 1
fi

echo "Setup complete. Use 'docker ps' to verify containers." 
