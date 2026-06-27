import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Preloaded beautiful cinematic mock themes/images as fallbacks when API is unavailable or limits hit
const PRESET_CINEMATIC_KEYFRAMES: Record<string, string[]> = {
  cyberpunk: [
    "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop"
  ],
  anime: [
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop"
  ],
  realistic: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop"
  ],
  "3d": [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop"
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini client lazily, so lack of variable doesn't crash on startup
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini Client successfully initialized");
    } catch (e) {
      console.error("Failed to initialize Gemini Client:", e);
    }
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined or is placeholder. Using mock visual model fallbacks.");
  }

  // --- API Routes ---

  // 1. Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!ai,
    });
  });

  // 2. Enhance Prompt using Gemini
  app.post("/api/enhance-prompt", async (req, res) => {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!ai) {
      // Fallback response with beautiful mock enhanced prompt
      const fallbacks = [
        `Cinematic masterpiece, ${prompt} under rich neon lights, volumetric atmospheric fog, detailed textures, Unreal Engine 5 render, high motion dynamics.`,
        `Extremely detailed professional cinematography of ${prompt}, soft golden hour sunlight, deep depth of field, captured on Arri Alexa, pristine detail.`,
        `Artistic breathtaking scene featuring ${prompt}, styled in immersive ${style || "cinematic"} style, rich chromatic palette, outstanding contrast, 8k resolution.`
      ];
      const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json({ enhancedPrompt: selected, isMock: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Enhance the following simple user video prompt into an incredibly descriptive, professional, cinematic video script prompt for an AI video generator. Output ONLY the final enhanced prompt description and nothing else.
User Prompt: "${prompt}"
Desired Style Vibe: ${style || "cinematic"}`,
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || prompt;
      res.json({ enhancedPrompt: text, isMock: false });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.json({
        enhancedPrompt: `Cinematic masterpiece detailing ${prompt}, styled with dramatic side lighting, shallow depth of field, highly detailed rendering.`,
        isMock: true,
        error: error.message,
      });
    }
  });

  // 3. Generate Multi-Scene Storyboard
  app.post("/api/generate-storyboard", async (req, res) => {
    const { concept } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Concept is required" });
    }

    if (!ai) {
      // Return high-quality mock storyboard
      const mockStoryboard = {
        concept: concept,
        scenes: [
          {
            sceneNumber: 1,
            title: "The Opening Vision",
            visualPrompt: `A gorgeous sweeping shot showcasing ${concept}, rich atmospheric haze, early dawn sunlight piercing through clouds, slow slider zoom movement.`,
            duration: 4,
            cameraMovement: "Slow Zoom In",
            musicAtmosphere: "Ethereal Orchestral Synth"
          },
          {
            sceneNumber: 2,
            title: "Dynamic Evolution",
            visualPrompt: `Close-up macro detail shot of ${concept} core element, electric energy crackling, high camera motion, fast particle streams, cyberpunk aesthetics.`,
            duration: 4,
            cameraMovement: "Fast Right Pan",
            musicAtmosphere: "Rhythmic Pulsing Techno"
          },
          {
            sceneNumber: 3,
            title: "The Grand Finale",
            visualPrompt: `Epic wide angle drone perspective of ${concept} resolving, sunset golden rays casting long shadows, deep dramatic clouds, cinematic fade.`,
            duration: 8,
            cameraMovement: "Drone Orbit Crane Out",
            musicAtmosphere: "Majestic Orchestral Crescendo"
          }
        ]
      };
      return res.json({ storyboard: mockStoryboard, isMock: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a cinematic, highly detailed 3-scene storyboard structure based on this user concept: "${concept}".
Generate appropriate prompts, durations, camera motions, and soundtracks for each.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    cameraMovement: { type: Type.STRING },
                    musicAtmosphere: { type: Type.STRING },
                  },
                  required: ["sceneNumber", "title", "visualPrompt", "duration", "cameraMovement", "musicAtmosphere"],
                }
              }
            },
            required: ["concept", "scenes"],
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({ storyboard: result, isMock: false });
    } catch (error: any) {
      console.error("Error generating storyboard:", error);
      // Fail gracefully with preset fallback
      const fallbackStoryboard = {
        concept: concept,
        scenes: [
          {
            sceneNumber: 1,
            title: "Scene 1: Introduction",
            visualPrompt: `An atmospheric establishing shot of ${concept}, high-contrast cinematic lighting.`,
            duration: 4,
            cameraMovement: "Slow Zoom",
            musicAtmosphere: "Ambient cinematic drone"
          },
          {
            sceneNumber: 2,
            title: "Scene 2: Core Action",
            visualPrompt: `Dynamic visual exploring ${concept} in motion, highly stylized lighting and textures.`,
            duration: 4,
            cameraMovement: "Orbit Left",
            musicAtmosphere: "Dramatic string swelling"
          },
          {
            sceneNumber: 3,
            title: "Scene 3: Resolution",
            visualPrompt: `A gorgeous, fading wide shot of ${concept}, long shadows, beautiful color grading.`,
            duration: 4,
            cameraMovement: "Tilt Up",
            musicAtmosphere: "Triumphant soft piano chord"
          }
        ]
      };
      res.json({ storyboard: fallbackStoryboard, isMock: true, error: error.message });
    }
  });

  // 4. Generate Video (which returns base64 image keyframe, audio, and details)
  app.post("/api/generate-video", async (req, res) => {
    const { prompt, style, aspectRatio, duration, motionStrength, cameraMovement, imageInput } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Determine fallback category
    let styleCategory = "realistic";
    const lowerPrompt = prompt.toLowerCase();
    const lowerStyle = (style || "").toLowerCase();
    if (lowerStyle.includes("anime") || lowerPrompt.includes("anime") || lowerPrompt.includes("cartoon")) {
      styleCategory = "anime";
    } else if (lowerStyle.includes("cyberpunk") || lowerStyle.includes("neon") || lowerPrompt.includes("neon")) {
      styleCategory = "cyberpunk";
    } else if (lowerStyle.includes("3d") || lowerStyle.includes("pixar") || lowerStyle.includes("toy")) {
      styleCategory = "3d";
    }

    const fallbacksList = PRESET_CINEMATIC_KEYFRAMES[styleCategory] || PRESET_CINEMATIC_KEYFRAMES.realistic;
    const fallbackImage = fallbacksList[Math.floor(Math.random() * fallbacksList.length)];

    // If an imageInput is already provided, use it
    if (imageInput) {
      return res.json({
        id: "task_" + Math.random().toString(36).substring(2, 9),
        prompt,
        style,
        aspectRatio,
        duration,
        motionStrength,
        cameraMovement,
        keyframeUrl: imageInput,
        audioAtmosphere: styleCategory === "cyberpunk" ? "Retro Synthwave Beat" : styleCategory === "anime" ? "Ethereal Lo-fi Piano" : "Symphonic Drone Waves",
        isMock: false
      });
    }

    // If client is initialized, let's try to generate a real image using gemini-2.5-flash-image
    if (ai) {
      try {
        // Map user's ratio to accepted model ratios: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
        let mappedRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9";
        if (aspectRatio === "9:16") mappedRatio = "9:16";
        else if (aspectRatio === "1:1") mappedRatio = "1:1";
        else if (aspectRatio === "4:3") mappedRatio = "4:3";

        const imagePrompt = `${prompt}. Beautiful cinematic shot, styled in ${style || "photorealistic digital art"} theme, extremely detailed, perfect composition, 8k resolution, photorealistic.`;

        const imageResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [{ text: imagePrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: mappedRatio,
              imageSize: "1K"
            },
          }
        });

        let base64Image: string | null = null;
        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              base64Image = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (base64Image) {
          return res.json({
            id: "task_" + Math.random().toString(36).substring(2, 9),
            prompt,
            style,
            aspectRatio,
            duration,
            motionStrength,
            cameraMovement,
            keyframeUrl: base64Image,
            audioAtmosphere: styleCategory === "cyberpunk" ? "Retro Synthwave Beat" : styleCategory === "anime" ? "Ethereal Lo-fi Piano" : "Symphonic Drone Waves",
            isMock: false
          });
        }
      } catch (err: any) {
        console.error("Gemini Image generation failed, falling back to unsplash preset:", err.message);
      }
    }

    // If gemini isn't configured, or image generation errored, return mock
    return res.json({
      id: "task_" + Math.random().toString(36).substring(2, 9),
      prompt,
      style,
      aspectRatio,
      duration,
      motionStrength,
      cameraMovement,
      keyframeUrl: fallbackImage,
      audioAtmosphere: styleCategory === "cyberpunk" ? "Retro Synthwave Beat" : styleCategory === "anime" ? "Ethereal Lo-fi Piano" : "Symphonic Drone Waves",
      isMock: true
    });
  });

  // --- New YouTube to Shorts / TikTok Clipping Endpoints ---

  const MOMENT_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
  ];

  app.post("/api/analyze-youtube", async (req, res) => {
    const { youtubeUrl } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Determine some topic from url or random
    let topicHint = "Motivational Secrets";
    if (youtubeUrl.includes("tech") || youtubeUrl.includes("review") || youtubeUrl.includes("apple") || youtubeUrl.includes("google")) {
      topicHint = "Tech Breakthrough";
    } else if (youtubeUrl.includes("mrbeast") || youtubeUrl.includes("challenge") || youtubeUrl.includes("vlog")) {
      topicHint = "Epic Challenge Vlog";
    } else if (youtubeUrl.includes("space") || youtubeUrl.includes("nasa") || youtubeUrl.includes("science")) {
      topicHint = "Cosmic Discoveries";
    }

    // Extract real YouTube Video ID for actual live play & thumbnail fetch
    let videoId = "ZXsQAXx_ao0"; // default fallback (Motivation)
    if (youtubeUrl.includes("motivation_secret_mindset")) {
      videoId = "ZXsQAXx_ao0";
    } else if (youtubeUrl.includes("galaxy_mysteries_spaces")) {
      videoId = "O79Zz6gSNo8";
    } else if (youtubeUrl.includes("iphone_18_ultra_leak")) {
      videoId = "KeK-S8m_wW0";
    } else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
      const match = youtubeUrl.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        videoId = match[2];
      }
    }
    const realThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    if (!ai) {
      // Mock viral clips with subtitles!
      const mockMoments = [
        {
          id: "m1",
          title: "🔥 L'Accroche d'Or : Comment nous y sommes parvenus",
          start: "00:15",
          end: "00:45",
          startTimeSec: 15,
          duration: 30,
          hook: "Boucle de curiosité immédiate soulignant le paradoxe central. Rétention de 98,4% des spectateurs.",
          viralityScore: 98,
          placeholderUrl: realThumbnail,
          transcript: [
            { time: 0, text: "Avez-vous déjà remarqué que la plupart des gens" },
            { time: 3, text: "échouent avant même d'avoir commencé ?" },
            { time: 6, text: "Ce n'est pas par manque de talent..." },
            { time: 9, text: "C'est parce qu'ils ont peur de l'inconnu." },
            { time: 13, text: "Mais aujourd'hui, tout va changer." },
            { time: 16, text: "Je vais vous révéler le secret le plus gardé" },
            { time: 20, text: "de l'industrie de la technologie moderne." },
            { time: 23, text: "Préparez-vous, car l'histoire commence maintenant." },
            { time: 27, text: "La clé n'est pas de travailler dur, mais d'agir intelligemment !" }
          ]
        },
        {
          id: "m2",
          title: "💡 La Révélation Choquante",
          start: "01:10",
          end: "01:35",
          startTimeSec: 70,
          duration: 25,
          hook: "Fait stupéfiant avec mise en scène dramatique. Idéal pour les boucles TikTok.",
          viralityScore: 94,
          placeholderUrl: realThumbnail,
          transcript: [
            { time: 0, text: "Imaginez un monde où votre téléphone" },
            { time: 3, text: "génère de l'énergie à chaque clic." },
            { time: 6, text: "C'est la révolution de l'informatique quantique." },
            { time: 10, text: "Plus de batteries mortes, plus de chargeurs !" },
            { time: 14, text: "Et le meilleur dans tout ça ?" },
            { time: 16, text: "C'est totalement décentralisé et gratuit." },
            { time: 19, text: "Les géants de la tech essaient de cacher cela." },
            { time: 22, text: "Mais le code est enfin public !" }
          ]
        },
        {
          id: "m3",
          title: "🚀 Climax d'Appel à l'Action",
          start: "02:40",
          end: "03:10",
          startTimeSec: 160,
          duration: 30,
          hook: "Résolution finale exigeant des partages, des likes et un fort engagement.",
          viralityScore: 91,
          placeholderUrl: realThumbnail,
          transcript: [
            { time: 0, text: "Le futur n'attend personne !" },
            { time: 3, text: "Chaque décision que vous prenez aujourd'hui" },
            { time: 6, text: "dessine votre réalité de demain." },
            { time: 9, text: "Alors, qu'attendez-vous ?" },
            { time: 11, text: "Rejoignez le mouvement, partagez cette vidéo !" },
            { time: 15, text: "Laissez un commentaire ci-dessous avec votre idée." },
            { time: 19, text: "Et n'oubliez pas de vous abonner pour la partie deux !" },
            { time: 23, text: "On se retrouve au sommet, très bientôt." },
            { time: 27, text: "Reste fort, reste curieux, et fonce !" }
          ]
        }
      ];

      return res.json({ youtubeUrl, moments: mockMoments, isMock: true });
    }

    try {
      // Prompt Gemini to analyze a simulated video transcripts matching the URL
      // and segmenting them into exactly 3 engaging viral moment shorts transcripts.
      const prompt = `Analyze this simulated YouTube video: "${youtubeUrl}".
The category/theme is roughly related to "${topicHint}".
Structure exactly 3 highly viral, short-form friendly clips (between 15 and 30 seconds duration) appropriate for YouTube Shorts and TikTok.
For each clip, you must provide:
1. Title (engaging short title with emoji)
2. Exact timestamps (e.g., start "00:15", end "00:45", startTimeSec: 15, duration: 30)
3. Viral Hook description (explaining why it goes viral)
4. Virality score (between 85 and 99)
5. A highly engaging French transcript with synchronized word offsets in seconds relative to the clip start (startTimeSec = 0). Write 6-10 lines of short, punchy sentences. Make the subtitles feel dramatic and viral!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              moments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    start: { type: Type.STRING },
                    end: { type: Type.STRING },
                    startTimeSec: { type: Type.INTEGER },
                    duration: { type: Type.INTEGER },
                    hook: { type: Type.STRING },
                    viralityScore: { type: Type.INTEGER },
                    transcript: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.INTEGER, description: "seconds relative to clip start" },
                          text: { type: Type.STRING }
                        },
                        required: ["time", "text"]
                      }
                    }
                  },
                  required: ["id", "title", "start", "end", "startTimeSec", "duration", "hook", "viralityScore", "transcript"]
                }
              }
            },
            required: ["moments"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const momentsWithPlaceholders = (parsed.moments || []).map((m: any, idx: number) => ({
        ...m,
        placeholderUrl: realThumbnail
      }));

      res.json({ youtubeUrl, moments: momentsWithPlaceholders, isMock: false });
    } catch (err: any) {
      console.error("Gemini analyze youtube failed:", err);
      res.status(500).json({ error: "Failed to analyze YouTube video clips" });
    }
  });

  // Secure server-side media download proxy to bypass CORS/sandboxing and guarantee correct file names and extensions
  app.get("/api/download-proxy", async (req, res) => {
    const { url, filename } = req.query;
    if (!url) {
      return res.status(400).send("URL parameter is required");
    }
    try {
      const response = await fetch(url as string);
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch media file from remote: ${response.statusText}`);
      }
      
      const safeFilename = (filename as string) || "clip.mp4";
      // Force direct download as attachment with correct filename and extension
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeFilename)}"`);
      
      const contentType = response.headers.get("content-type") || "video/mp4";
      res.setHeader("Content-Type", contentType);
      
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Error in download-proxy:", err);
      res.status(500).send("Internal server error during media download");
    }
  });

  // Serve active workspace views 
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express-Vite Server running on http://localhost:${PORT}`);
  });
}

startServer();
