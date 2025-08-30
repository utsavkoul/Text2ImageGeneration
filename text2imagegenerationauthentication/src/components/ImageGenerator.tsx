import React, { useState } from 'react';
import { ImageIcon, Wand2, LogOut, User, Images } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GeneratedImage, ImageGenerationOptions, DEFAULT_OPTIONS } from '../types/image';
import ImageOptionsPanel from './ImageOptionsPanel';
import UserImageGallery from './UserImageGallery';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ImageGenerationOptions>(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  
  const { user, logout } = useAuth();

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          userId: user?.id,
          options: options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      const newImage: GeneratedImage = {
        id: data.id,
        url: data.url,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        userId: user?.id || '',
        filename: data.filename,
        options: { ...options }
      };

      setRecentImages(prev => [newImage, ...prev.slice(0, 5)]); // Keep only 6 recent images
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.');
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Image Generator
                </h1>
                <p className="text-sm text-gray-600">Transform your ideas into stunning visuals</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Images className="w-4 h-4 inline mr-2" />
                Gallery
              </button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:inline">Welcome, {user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-all ${
                activeTab === 'generate'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-all ${
                activeTab === 'gallery'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <Images className="w-4 h-4 inline mr-2" />
              Gallery
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'generate' ? (
          <div className="space-y-8">
            {/* Generation Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 text-center">
                  Describe your vision
                </h2>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="A majestic dragon soaring through clouds at sunset, digital art style..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none h-24 text-gray-700 placeholder-gray-400"
                    disabled={isGenerating}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {prompt.length}/500
                  </div>
                </div>

                <ImageOptionsPanel
                  options={options}
                  onChange={setOptions}
                  isOpen={showOptions}
                  onToggle={() => setShowOptions(!showOptions)}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Generated Images */}
            {recentImages.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  Recently Generated
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentImages.map((image) => (
                    <div
                      key={image.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <button
                            onClick={() => downloadImage(image)}
                            className="opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full transition-all duration-200 shadow-lg"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{new Date(image.timestamp).toLocaleString()}</span>
                          <span>{image.options.width}×{image.options.height}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <UserImageGallery />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Powered by AI • Create stunning images from text descriptions</p>
        </div>
      </footer>
    </div>
  );
};

export default ImageGenerator;