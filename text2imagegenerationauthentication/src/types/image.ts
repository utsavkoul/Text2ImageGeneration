export interface ImageGenerationOptions {
  width: number;
  height: number;
  steps: number;
  seed: number;
  negativePrompt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  userId: string;
  filename: string;
  options: ImageGenerationOptions;
}

export const DEFAULT_OPTIONS: ImageGenerationOptions = {
  width: 512,
  height: 512,
  steps: 30,
  seed: -1,
  negativePrompt: '',
};

export const PRESET_SIZES = [
  { label: 'Square (512x512)', width: 512, height: 512 },
  { label: 'Portrait (512x768)', width: 512, height: 768 },
  { label: 'Landscape (768x512)', width: 768, height: 512 },
  { label: 'HD Portrait (768x1024)', width: 768, height: 1024 },
  { label: 'HD Landscape (1024x768)', width: 1024, height: 768 },
];