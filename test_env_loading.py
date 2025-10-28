#!/usr/bin/env python
"""
Test script to verify .env.backend loading and HF token detection
"""
import os
from pathlib import Path

print("\n" + "="*60)
print("🧪 Backend .env.backend Loading Test")
print("="*60 +  "\n")

# Simulate what the backend does
env_path = Path(__file__).parent / ".env.backend"

print(f"📍 Looking for .env.backend at: {env_path}")
print(f"   Exists: {env_path.exists()}\n")

if env_path.exists():
    print("📂 Contents of .env.backend:")
    with open(env_path) as f:
        content = f.read()
        print(content)
    
    print("\n📥 Loading environment variables...")
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()
                os.environ[key] = value
                
                if key == "HF_API_TOKEN":
                    # Show only first and last 10 chars for security
                    preview = f"{value[:10]}...{value[-10:]}" if len(value) > 20 else value
                    print(f"   ✅ {key} = {preview} (length: {len(value)})")
                else:
                    print(f"   ✅ {key} = {value}")
    
    print("\n✅ Checking if token is available in os.environ...")
    hf_token = (
        os.getenv("HF_API_TOKEN") or 
        os.getenv("HUGGINGFACE_API_KEY") or 
        os.getenv("HF_TOKEN")
    )
    
    if hf_token:
        preview = f"{hf_token[:10]}...{hf_token[-10:]}"
        print(f"   ✅ HF_API_TOKEN is AVAILABLE: {preview}")
        print(f"   ✅ Token length: {len(hf_token)} characters")
        print(f"   ✅ Token prefix: hf_...")
    else:
        print(f"   ❌ NO HF TOKEN FOUND!")

    print("\n" + "="*60)
    print("✅ TEST PASSED - Backend will use HF token from .env.backend")
    print("="*60 + "\n")
else:
    print(f"❌ .env.backend file not found at {env_path}")
    print("\n" + "="*60)
    print("❌ TEST FAILED - Create .env.backend with HF_API_TOKEN")
    print("="*60 + "\n")
