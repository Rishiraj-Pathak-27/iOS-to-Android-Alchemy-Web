import requests
from PIL import Image
from pathlib import Path
import time

time.sleep(2)  # Give server time to start

# Create a simple test image
test_image_path = "test_image.jpg"
img = Image.new('RGB', (64, 64), color='white')
img.save(test_image_path)

try:
    # Test the enhance endpoint with file upload
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test.jpg', f, 'image/jpeg')}
        response = requests.post(
            'http://127.0.0.1:8000/api/enhance',
            files=files,
            timeout=60
        )

    print("\n" + "="*60)
    print("ENHANCEMENT TEST RESULT")
    print("="*60)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Model Used: {result.get('model_used', 'unknown')}")
        print(f"✅ PSNR Before: {result.get('psnr_before', 'N/A')}")
        print(f"✅ PSNR After: {result.get('psnr_after', 'N/A')}")
        print(f"✅ Token was loaded: {'hf_debug' in result}")
        if 'hf_debug' in result:
            print(f"✅ HF Debug: {result['hf_debug']}")
    else:
        print(f"❌ Error ({response.status_code}): {response.text}")

    print("="*60)

except Exception as e:
    print(f"❌ Request failed: {e}")

# Cleanup
Path(test_image_path).unlink(missing_ok=True)
