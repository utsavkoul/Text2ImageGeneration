# AI Image Generator Web App

A modern web application that generates images from text descriptions using AI. Built with React frontend and Python Flask backend.

## Features

- 🎨 Generate high-quality images from text prompts
- 🖼️ Beautiful, responsive gallery interface
- 💾 Download generated images
- ⚡ Real-time generation with loading states
- 🎯 Clean, modern UI with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

**Backend:**
- Python Flask
- Nebius AI API for image generation
- Flask-CORS for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package manager)

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python app.py
   ```
   
   Or use the convenience script:
   ```bash
   python run.py
   ```

### Usage
1. Make sure both frontend and backend servers are running
2. Open your browser to `http://localhost:5173`
3. Enter a detailed text description of the image you want to generate
4. Click "Generate Image" and wait for the AI to create your image
5. Download or view your generated images in the gallery

### API Endpoints

- `POST /api/generate-image` - Generate an image from a text prompt
- `GET /api/images/<filename>` - Serve generated images
- `GET /api/health` - Health check endpoint

### Environment Variables

The backend uses the Nebius AI API. The API key is currently hardcoded in the backend for demo purposes. In production, you should:

1. Create a `.env` file in the backend directory
2. Add your API key: `NEBIUS_API_KEY=your_api_key_here`
3. Update the code to use `os.getenv('NEBIUS_API_KEY')`

## Project Structure

```
├── src/                    # React frontend source
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   ├── run.py            # Convenience script to run server
│   └── generated_images/ # Directory for saved images
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.