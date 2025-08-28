#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def run_server():
    """Run the Flask server"""
    print("Starting Flask server...")
    try:
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error running server: {e}")

if __name__ == "__main__":
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Install requirements and run server
    if install_requirements():
        run_server()
    else:
        print("Failed to install requirements. Please install manually.")