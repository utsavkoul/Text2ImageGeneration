import React from 'react';
import { Settings, Shuffle } from 'lucide-react';
import { ImageGenerationOptions, PRESET_SIZES } from '../types/image';

interface ImageOptionsPanelProps {
  options: ImageGenerationOptions;
  onChange: (options: ImageGenerationOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ImageOptionsPanel: React.FC<ImageOptionsPanelProps> = ({
  options,
  onChange,
  isOpen,
  onToggle,
}) => {
  const handleSizeChange = (width: number, height: number) => {
    onChange({ ...options, width, height });
  };

  const randomizeSeed = () => {
    onChange({ ...options, seed: Math.floor(Math.random() * 1000000) });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Advanced Options</span>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 space-y-6">
          {/* Image Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Image Size
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_SIZES.map((size) => (
                <button
                  key={`${size.width}x${size.height}`}
                  onClick={() => handleSizeChange(size.width, size.height)}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    options.width === size.width && options.height === size.height
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{size.label}</div>
                  <div className="text-sm text-gray-500">{size.width} × {size.height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="number"
                value={options.width}
                onChange={(e) => onChange({ ...options, width: parseInt(e.target.value) || 512 })}
                min="256"
                max="1024"
                step="64"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="number"
                value={options.height}
                onChange={(e) => onChange({ ...options, height: parseInt(e.target.value) || 512 })}
                min="256"
                max="1024"
                step="64"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Inference Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Steps: {options.steps}
            </label>
            <input
              type="range"
              value={options.steps}
              onChange={(e) => onChange({ ...options, steps: parseInt(e.target.value) })}
              min="10"
              max="50"
              step="5"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fast (10)</span>
              <span>Balanced (30)</span>
              <span>High Quality (50)</span>
            </div>
          </div>

          {/* Seed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seed (for reproducible results)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={options.seed === -1 ? '' : options.seed}
                onChange={(e) => onChange({ ...options, seed: e.target.value ? parseInt(e.target.value) : -1 })}
                placeholder="Random (-1)"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={randomizeSeed}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Negative Prompt (what to avoid)
            </label>
            <textarea
              value={options.negativePrompt}
              onChange={(e) => onChange({ ...options, negativePrompt: e.target.value })}
              placeholder="blurry, low quality, distorted..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageOptionsPanel;