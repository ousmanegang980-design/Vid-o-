import { VideoStyle } from "./types";

export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: "cinematic",
    name: "Cyberpunk City",
    category: "Cinematic",
    description: "Sleek high-tech neon lighting with atmospheric fog",
    thumbnailUrl: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=200&auto=format&fit=crop",
    promptAddon: "cyberpunk, rich neon lighting, futuristic city streets, wet ground reflections, atmospheric blue and pink haze, cinematic, 8k, photorealistic"
  },
  {
    id: "gothic",
    name: "Dark Fantasy",
    category: "Cinematic",
    description: "Grim gothic environments with mysterious lighting",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop",
    promptAddon: "grim gothic fantasy, epic scale, dynamic dark clouds, ancient ruins, ominous lighting, mystical smoke, volumetric shadows, cinematic"
  },
  {
    id: "anime-classic",
    name: "90s Retro Anime",
    category: "Anime/Art",
    description: "Classic hand-drawn cell animation look with soft coloring",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop",
    promptAddon: "90s retro anime aesthetic, cell animation style, soft pastel colors, vintage film grain, hand-drawn detailing, classic anime scene"
  },
  {
    id: "anime-cyber",
    name: "Modern Cyber Anime",
    category: "Anime/Art",
    description: "Crisp lines and glowing neon accents in anime format",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200&auto=format&fit=crop",
    promptAddon: "vibrant modern anime, neon-lit key visuals, highly detailed linework, spectacular lighting fx, cyberpunk aesthetic, masterpiece"
  },
  {
    id: "watercolor",
    name: "Watercolor Dream",
    category: "Anime/Art",
    description: "Flowing ink textures and soft, blended visual dreamscapes",
    thumbnailUrl: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=200&auto=format&fit=crop",
    promptAddon: "artistic watercolor painting, flowing paint drops, paper texture, soft glowing pastel colors, whimsical atmosphere, abstract brushstrokes"
  },
  {
    id: "realistic-nature",
    name: "National Geo Nature",
    category: "Realistic",
    description: "Breathtaking real-world landscapes and wildlife macro shots",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200&auto=format&fit=crop",
    promptAddon: "photorealistic nature capture, crystal clear wildlife macro, volumetric morning rays, dew on leaves, 4k Arri Alexa cinematic video, perfect exposure"
  },
  {
    id: "realistic-macro",
    name: "Sci-Fi Space Tech",
    category: "Realistic",
    description: "Highly polished hardware panels and starfield explorations",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
    promptAddon: "photorealistic space technology, deep nebulae starfield background, gleaming chrome plating, detailed electrical conduits, cold warning led indicators, 8k render"
  },
  {
    id: "pixar-3d",
    name: "Pixar Animation",
    category: "3D/Pixar",
    description: "Heartwarming 3D character design and soft toy textures",
    thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200&auto=format&fit=crop",
    promptAddon: "charming 3d animated film style, soft subsurface scattering skin shaders, clay texture detailing, vibrant rich colors, whimsical character art"
  }
];

export const MOCK_GALLERY: Array<{
  id: string;
  title: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  keyframeUrl: string;
  duration: number;
  motionStrength: 'low' | 'medium' | 'high';
  cameraMovement: string;
  audioAtmosphere: string;
}> = [
  {
    id: "gal_1",
    title: "Neon Alley Run",
    prompt: "A cybernetic rogue sprinting down a rain-soaked futuristic alleyway surrounded by neon advertisements",
    style: "Cyberpunk City",
    aspectRatio: "16:9",
    keyframeUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    duration: 4,
    motionStrength: "high",
    cameraMovement: "Fast Pan Right",
    audioAtmosphere: "Retro Synthwave Beat"
  },
  {
    id: "gal_2",
    title: "Cosmic Nebula",
    prompt: "An astronaut floating gently in a swirling cosmic nursery of purple and indigo dust clouds, star-forming regions",
    style: "Sci-Fi Space Tech",
    aspectRatio: "16:9",
    keyframeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    duration: 8,
    motionStrength: "low",
    cameraMovement: "Slow Zoom In",
    audioAtmosphere: "Symphonic Drone Waves"
  },
  {
    id: "gal_3",
    title: "Lost Cat in Tokyo",
    prompt: "A cute orange kitten wandering near shibuya crossway, modern anime key frames, cinematic sunset glow",
    style: "Modern Cyber Anime",
    aspectRatio: "9:16",
    keyframeUrl: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=800&auto=format&fit=crop",
    duration: 4,
    motionStrength: "medium",
    cameraMovement: "Tilt Down",
    audioAtmosphere: "Ethereal Lo-fi Piano"
  },
  {
    id: "gal_4",
    title: "Mountain Mist Sunrise",
    prompt: "Epic sweeping sunrise cutting through mountain peaks, green valleys, roaring waterfall below, misty forest",
    style: "National Geo Nature",
    aspectRatio: "16:9",
    keyframeUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
    duration: 8,
    motionStrength: "medium",
    cameraMovement: "Slow Zoom Out",
    audioAtmosphere: "Symphonic Drone Waves"
  },
  {
    id: "gal_5",
    title: "Magical Enchanted Forest",
    prompt: "An ancient oak tree glowing with blue bioluminescent mushrooms, woodland pixies fluttering, soft mossy floor",
    style: "Dark Fantasy",
    aspectRatio: "4:3",
    keyframeUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    duration: 8,
    motionStrength: "low",
    cameraMovement: "Orbit Left",
    audioAtmosphere: "Ethereal Orchestral Synth"
  }
];

export const PROMPT_IDEAS = [
  "A majestic griffin taking off from a snowy mountain peak at sunrise, majestic wings flapping, snow spraying",
  "A hyperdetailed glass bottle floating in a sparkling cosmic ocean, filled with a swirling galaxy of stars",
  "An ancient steam-locomotive train flying through a cloud-filled neon sky, fantasy vapor trails",
  "A high-speed cybernetic race car drifting on a slick neon racetrack under driving rain",
  "A cinematic wide shot of a futuristic greenhouse dome filled with bioluminescent exotic plants on Mars",
  "A close-up of a whimsical robot artisan carefully painting a tiny glass sculpture, soft Pixar lighting"
];
