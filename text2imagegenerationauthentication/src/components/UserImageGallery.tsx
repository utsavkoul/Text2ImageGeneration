import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, Calendar, Settings } from 'lucide-react';
import { GeneratedImage } from '../types/image';
import { useAuth } from '../contexts/AuthContext';

const UserImageGallery: React.FC = () => {
  const [userImages, setUserImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadUserImages();
  }, [user]);

  const loadUserImages = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/${user.id}/images`);
      if (response.ok) {
        const images = await response.json();
        setUserImages(images);
      }
    } catch (error) {
      console.error('Error loading user images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUserImages(prev => prev.filter(img => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
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
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Your Gallery</h2>
        <span className="text-sm text-gray-500">{userImages.length} images</span>
      </div>

      {userImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No images yet</h3>
          <p className="text-gray-500">Generate your first image to see it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {userImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200 shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.id);
                      }}
                      className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full transition-all duration-200 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {image.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(image.timestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    {image.options.width}×{image.options.height}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Image Details</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full max-h-96 object-contain rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prompt:</label>
                  <p className="text-gray-600 mt-1">{selectedImage.prompt}</p>
                </div>
                
                {selectedImage.options.negativePrompt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Negative Prompt:</label>
                    <p className="text-gray-600 mt-1">{selectedImage.options.negativePrompt}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">Size:</label>
                    <p className="text-gray-600">{selectedImage.options.width} × {selectedImage.options.height}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Steps:</label>
                    <p className="text-gray-600">{selectedImage.options.steps}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Seed:</label>
                    <p className="text-gray-600">{selectedImage.options.seed === -1 ? 'Random' : selectedImage.options.seed}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Created:</label>
                    <p className="text-gray-600">{new Date(selectedImage.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => downloadImage(selectedImage)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => deleteImage(selectedImage.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImageGallery;