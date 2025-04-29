import subprocess
import sys

def install_package(package):
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# List of required packages
required_packages = [
    "fastapi",
    "uvicorn",
    "python-socketio",
    "aiohttp",
    "websockets"
]

# Install each package
for package in required_packages:
    try:
        install_package(package)
        print(f"✅ {package} installed successfully")
    except Exception as e:
        print(f"❌ Failed to install {package}: {e}")

print("\nAll required packages installed. You can now run your server with:")
print("uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug")