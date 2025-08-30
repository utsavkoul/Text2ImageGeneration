from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import uuid
import json
from datetime import datetime
import logging
from openai import OpenAI
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
IMAGES_DIR = 'generated_images'
USERS_FILE = 'users.json'
USER_IMAGES_FILE = 'user_images.json'
os.makedirs(IMAGES_DIR, exist_ok=True)

# Create user-specific image directories
def ensure_user_directory(user_id):
    """Ensure user-specific directory exists"""
    user_dir = os.path.join(IMAGES_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

# Nebius API configuration
NEBIUS_API_KEY = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTIyMTI3MzU4Mzg1MjYxMDA4MiIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkxMzk2ODYyOSwidXVpZCI6ImNjNGViNzRjLWIzMjctNDZjNy1hYTc2LTBiOTE0YmI4M2FhOSIsIm5hbWUiOiJpbWFnZWdlbmVyYXRpb25vcGVuYWkiLCJleHBpcmVzX2F0IjoiMjAzMC0wOC0yNlQwOTo1NzowOSswMDAwIn0.z0q_u7GPQI5UNyqWzFsmVN-E3uX7m-g_buqp5Lcej9Y"
os.environ["NEBIUS_API_KEY"] = NEBIUS_API_KEY

# Initialize OpenAI client for Nebius
client = OpenAI(
    base_url="https://api.studio.nebius.com/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)

# User management functions
def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_user_images():
    """Load user images metadata from JSON file"""
    if os.path.exists(USER_IMAGES_FILE):
        try:
            with open(USER_IMAGES_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_user_images(user_images):
    """Save user images metadata to JSON file"""
    with open(USER_IMAGES_FILE, 'w') as f:
        json.dump(user_images, f, indent=2)

def hash_password(password):
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_image_with_nebius(prompt, options):
    """Generate image using Nebius API with custom options"""
    try:  
        response = client.images.generate(
            model="stability-ai/sdxl",
            response_format="url",
            extra_body={
                "response_extension": "png",
                "width": options.get('width', 512),
                "height": options.get('height', 512),
                "num_inference_steps": options.get('steps', 30),
                "negative_prompt": options.get('negativePrompt', ''),
                "seed": options.get('seed', -1),
                "loras": None
            },
            prompt=prompt
        )
        
        # Return the URL from the response
        if response.data and len(response.data) > 0:
            return response.data[0].url
        else:
            logger.error("No image data returned from Nebius API")
            return None
            
    except Exception as e:
        logger.error(f"Error generating image with Nebius: {str(e)}")
        return None

def download_and_save_image(image_url, user_id, filename):
    """Download image from URL and save in user-specific directory"""
    try:
        user_dir = ensure_user_directory(user_id)
        response = requests.get(image_url, timeout=30)
        if response.status_code == 200:
            filepath = os.path.join(user_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return filepath
        return None
    except Exception as e:
        logger.error(f"Error downloading image: {str(e)}")
        return None

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not name:
            return jsonify({'message': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        users = load_users()
        
        if email in users:
            return jsonify({'message': 'User already exists'}), 400
        
        # Create new user
        user_id = str(uuid.uuid4())
        users[email] = {
            'id': user_id,
            'email': email,
            'name': name,
            'password': hash_password(password),
            'createdAt': datetime.now().isoformat()
        }
        
        save_users(users)
        
        # Create user directory for images
        ensure_user_directory(user_id)
        
        # Return user data (without password)
        user_data = {
            'id': user_id,
            'email': email,
            'name': name,
            'createdAt': users[email]['createdAt']
        }
        
        return jsonify(user_data), 201
        
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        users = load_users()
        
        if email not in users:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        user = users[email]
        if user['password'] != hash_password(password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Ensure user directory exists
        ensure_user_directory(user['id'])
        
        # Return user data (without password)
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'createdAt': user['createdAt']
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        user_id = data.get('userId', '')
        options = data.get('options', {})
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        logger.info(f"Generating image for user {user_id} with prompt: {prompt}")
        logger.info(f"Options: {options}")
        
        # Generate image using Nebius API
        image_url = generate_image_with_nebius(prompt, options)
        
        if not image_url:
            return jsonify({'error': 'Failed to generate image'}), 500
        
        # Generate unique filename and ID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        image_id = str(uuid.uuid4())
        filename = f"generated_{timestamp}_{unique_id}.png"
        
        # Download and save image in user-specific directory
        local_path = download_and_save_image(image_url, user_id, filename)
        
        if local_path:
            # Save image metadata
            user_images = load_user_images()
            if user_id not in user_images:
                user_images[user_id] = []
            
            image_metadata = {
                'id': image_id,
                'filename': filename,
                'prompt': prompt,
                'timestamp': datetime.now().isoformat(),
                'options': options,
                'url': f"/api/images/{user_id}/{filename}"
            }
            
            user_images[user_id].append(image_metadata)
            save_user_images(user_images)
            
            # Return image data
            return jsonify({
                'id': image_id,
                'url': f"/api/images/{user_id}/{filename}",
                'filename': filename
            })
        else:
            # If local save fails, return the original URL
            return jsonify({
                'id': image_id,
                'url': image_url,
                'filename': filename
            })
            
    except Exception as e:
        logger.error(f"Error in generate_image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/images/<user_id>/<filename>')
def serve_user_image(user_id, filename):
    """Serve user-specific generated images"""
    try:
        user_dir = os.path.join(IMAGES_DIR, user_id)
        return send_from_directory(user_dir, filename)
    except Exception as e:
        logger.error(f"Error serving image {filename} for user {user_id}: {str(e)}")
        return jsonify({'error': 'Image not found'}), 404

@app.route('/api/user/<user_id>/images', methods=['GET'])
def get_user_images(user_id):
    """Get all images for a specific user"""
    try:
        user_images = load_user_images()
        images = user_images.get(user_id, [])
        
        # Sort by timestamp (newest first)
        images.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify(images)
        
    except Exception as e:
        logger.error(f"Error getting user images: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/images/<image_id>', methods=['DELETE'])
def delete_image(image_id):
    """Delete a specific image"""
    try:
        user_images = load_user_images()
        
        # Find and remove the image
        for user_id, images in user_images.items():
            for i, image in enumerate(images):
                if image['id'] == image_id:
                    # Remove from metadata
                    deleted_image = images.pop(i)
                    save_user_images(user_images)
                    
                    # Remove physical file
                    try:
                        file_path = os.path.join(IMAGES_DIR, user_id, deleted_image['filename'])
                        if os.path.exists(file_path):
                            os.remove(file_path)
                    except Exception as e:
                        logger.warning(f"Could not delete physical file: {str(e)}")
                    
                    return jsonify({'message': 'Image deleted successfully'})
        
        return jsonify({'error': 'Image not found'}), 404
        
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)