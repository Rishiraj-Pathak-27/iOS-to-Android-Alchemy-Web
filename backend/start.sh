#!/bin/bash

# Start Real-ESRGAN Backend
# This script is used by Railway to start the backend service

echo "🚀 Starting Real-ESRGAN Enhancement API..."
echo "📍 Port: $PORT (default: 8000)"
echo "👷 Workers: 4 (Gunicorn)"

# Set default port to 8000 if not provided
PORT=${PORT:-8000}

# Start Gunicorn with proper configuration
gunicorn -w 4 \
         -b 0.0.0.0:$PORT \
         main:app \
         --timeout 120 \
         --graceful-timeout 30 \
         --keep-alive 5 \
         --access-logfile - \
         --error-logfile - \
         --log-level info

