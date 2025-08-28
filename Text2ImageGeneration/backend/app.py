from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import uuid
from datetime import datetime
import logging
from openai import OpenAI
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
IMAGES_DIR = 'generated_images'
os.makedirs(IMAGES_DIR, exist_ok=True)

# Nebius API configuration
# NEBIUS_API_KEY = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTIyMTI3MzU4Mzg1MjYxMDA4MiIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkxMzk2ODYyOSwidXVpZCI6ImNjNGViNzRjLWIzMjctNDZjNy1hYTc2LTBiOTE0YmI4M2FhOSIsIm5hbWUiOiJpbWFnZWdlbmVyYXRpb25vcGVuYWkiLCJleHBpcmVzX2F0IjoiMjAzMC0wOC0yNlQwOTo1NzowOSswMDAwIn0.z0q_u7GPQI5UNyqWzFsmVN-E3uX7m-g_buqp5Lcej9Y"
# NEBIUS_BASE_URL = "https://api.studio.nebius.com/v1/"
os.environ["NEBIUS_API_KEY"] = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTIyMTI3MzU4Mzg1MjYxMDA4MiIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkxMzk2ODYyOSwidXVpZCI6ImNjNGViNzRjLWIzMjctNDZjNy1hYTc2LTBiOTE0YmI4M2FhOSIsIm5hbWUiOiJpbWFnZWdlbmVyYXRpb25vcGVuYWkiLCJleHBpcmVzX2F0IjoiMjAzMC0wOC0yNlQwOTo1NzowOSswMDAwIn0.z0q_u7GPQI5UNyqWzFsmVN-E3uX7m-g_buqp5Lcej9Y"
client = OpenAI(
    base_url="https://api.studio.nebius.com/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)
def generate_image_with_nebius(prompt):
    """Generate image using Nebius API"""
    try:  
        response = client.images.generate(
        model="stability-ai/sdxl",
        response_format="url",
        extra_body={
        "response_extension": "png",
        "width": 512,
        "height": 512,
        "num_inference_steps": 30,
        "negative_prompt": "",
        "seed": -1,
        "loras": None
    },
        prompt=prompt
)
        
        if response.data[0].url != None:
        #     data = response.json()
            # image = requests.get(response.data[0].url)
            # with open(f"astronaut{file_name}.png", "wb") as f:
            #      f.write(image.content)
            # image.save(f"astronaut_horse{file_name}.png")
            return response.data[0].url
            #   return f"https://pictures-storage.storage.eu-north1.nebius.cloud/text2img-21bdea5f-1b59-427b-ac6a-baab21208408_00001_.png"
        else:
            logger.error(f"Nebius API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error generating image with Nebius: {str(e)}")
        return None

def download_and_save_image(image_url, filename):
    """Download image from URL and save locally"""
    try:
        response = requests.get(image_url, timeout=30)
        if response.status_code == 200:
            filepath = os.path.join(IMAGES_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return filepath
        return None
    except Exception as e:
        logger.error(f"Error downloading image: {str(e)}")
        return None

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        logger.info(f"Generating image for prompt: {prompt}")
        
        # Generate image using Nebius API
        image_url = generate_image_with_nebius(prompt)
        
        if not image_url:
            return jsonify({'error': 'Failed to generate image'}), 500
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"generated_{timestamp}_{unique_id}.png"
        
        # Download and save image locally
        local_path = download_and_save_image(image_url, filename)
        
        if local_path:
            # Return local URL for serving
            local_url = f"/api/images/{filename}"
            return jsonify({
                'image_url': local_url,
                'prompt': prompt,
                'filename': filename
            })
        else:
            # If local save fails, return the original URL
            return jsonify({
                'image_url': image_url,
                'prompt': prompt,
                'filename': filename
            })
            
    except Exception as e:
        logger.error(f"Error in generate_image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/images/<filename>')
def serve_image(filename):
    """Serve generated images"""
    try:
        return send_from_directory(IMAGES_DIR, filename)
    except Exception as e:
        logger.error(f"Error serving image {filename}: {str(e)}")
        return jsonify({'error': 'Image not found'}), 404

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)