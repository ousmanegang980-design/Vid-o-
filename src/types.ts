export interface VideoGenerationConfig {
  prompt: string;
  style: string;
  aspectRatio: string;
  duration: number; // in seconds (4 or 8)
  motionStrength: 'low' | 'medium' | 'high';
  cameraMovement: string;
  imageInput?: string; // base64 encoded string
}

export interface VideoTask {
  id: string;
  status: 'queued' | 'analyzing' | 'generating_frames' | 'interpolating' | 'completed' | 'failed';
  progress: number;
  currentStage: string;
  error?: string;
  config: VideoGenerationConfig;
  keyframeUrl?: string; // image representation
  audioAtmosphere?: string; // music vibe
  createdAt: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  duration: number;
  cameraMovement: string;
  musicAtmosphere: string;
}

export interface Storyboard {
  concept: string;
  scenes: StoryboardScene[];
}

export interface VideoStyle {
  id: string;
  name: string;
  category: 'Cinematic' | 'Anime/Art' | 'Realistic' | '3D/Pixar';
  description: string;
  thumbnailUrl: string;
  promptAddon: string;
}

export interface TranscriptSegment {
  time: number; // offset in seconds relative to clip start
  text: string;
}

export interface ViralMoment {
  id: string;
  title: string;
  start: string; // e.g. "01:24"
  end: string;   // e.g. "02:14"
  startTimeSec: number;
  duration: number;
  hook: string;
  viralityScore: number;
  transcript: TranscriptSegment[];
  placeholderUrl: string;
}

export interface AvoidCopyrightConfig {
  mirrorEffect: boolean;
  zoomScale: number; // e.g. 1.12
  blurredBackground: boolean;
  colorFilter: 'none' | 'vintage' | 'teal_orange' | 'warm_gold' | 'cyberpunk';
  speedFactor: number; // e.g. 1.02
  subtitleStyle: 'karaoke_yellow' | 'cyberpunk_glow' | 'minimalist' | 'pop_cartoon' | 'none';
  watermarkClean: boolean;
}

export interface ClippingTask {
  id: string;
  youtubeUrl: string;
  moments: ViralMoment[];
  status: 'idle' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
}

