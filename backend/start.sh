#!/bin/bash
# Production backend startup script for Railway

# Set environment variables for Railway
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

# Start backend with optimized settings
python main.py --workers 2 --timeout 30
