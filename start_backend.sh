#!/bin/bash
# Load environment variables from .env.backend
if [ -f .env.backend ]; then
    export $(cat .env.backend | grep -v '^#' | xargs)
fi

# Start the backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
