import React, { useState, useRef } from "react";
import { Sparkles, Image, RefreshCw, AlertCircle, Video, Camera, Info, HelpCircle, Loader2, Trash2, Sliders, PlaySquare } from "lucide-react";
import { VIDEO_STYLES, PROMPT_IDEAS } from "../data";
import { VideoGenerationConfig, VideoStyle } from "../types";

interface SidebarProps {
  onGenerate: (config: VideoGenerationConfig) => void;
  isGenerating: boolean;
  credits: number;
}

export default function Sidebar({ onGenerate, isGenerating, credits }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("cinematic");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Fine-tuning states
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [duration, setDuration] = useState<number>(4);
  const [motionStrength, setMotionStrength] = useState<'low' | 'medium' | 'high'>("medium");
  const [cameraMovement, setCameraMovement] = useState<string>("Slow Zoom In");

  // Image input states (Image-to-Video)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Enhance prompt with Gemini API
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });
      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (e) {
      console.error("Failed to enhance prompt:", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Surprise Me randomizer
  const handleSurpriseMe = () => {
    const randomPrompt = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
    setPrompt(randomPrompt);
  };

  // Image upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Style category filter helper
  const stylesFiltered = categoryFilter === "All"
    ? VIDEO_STYLES
    : VIDEO_STYLES.filter((s) => s.category === categoryFilter);

  // Generate action dispatcher
  const handleGenerateClick = () => {
    if (activeTab === "text" && !prompt.trim()) return;
    if (activeTab === "image" && !imagePreview) return;

    const chosenStyle = VIDEO_STYLES.find((s) => s.id === selectedStyle);
    const finalPromptText = activeTab === "text" 
      ? `${prompt} (Style: ${chosenStyle?.name || ""})` 
      : `Animate this starting image: ${prompt || "cinematic scene animation"}`;

    onGenerate({
      prompt: finalPromptText,
      style: chosenStyle?.name || "Realistic",
      aspectRatio,
      duration,
      motionStrength,
      cameraMovement,
      imageInput: imagePreview || undefined,
    });
  };

  // Dynamic cost calculation
  const creditCost = duration === 8 ? 8 : 4;

  return (
    <div id="sidebar-configuration-panel" className="w-full bg-zinc-950/70 border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
      
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
          <Video className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white font-display">Generation Suite</h1>
          <p className="text-xs text-gray-400">Design motions with text or images</p>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
        <button
          id="tab-text-to-video"
          onClick={() => setActiveTab("text")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md cursor-pointer transition-all ${
            activeTab === "text" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Text to Video
        </button>
        <button
          id="tab-image-to-video"
          onClick={() => setActiveTab("image")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md cursor-pointer transition-all ${
            activeTab === "image" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"
          }`}
        >
          <Image className="w-3.5 h-3.5" /> Image to Video
        </button>
      </div>

      {/* 1. Prompt input field */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold">Prompt Instruction</span>
          <button
            id="surprise-me-btn"
            onClick={handleSurpriseMe}
            className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
          >
            Surprise Me
          </button>
        </div>
        <div className="relative">
          <textarea
            id="prompt-textarea"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              activeTab === "text"
                ? "Describe what happens in your scene (e.g., A slow macro panning of glowing mushrooms in an enchanted ancient forest...)"
                : "Describe how to animate your starting image (e.g., Gentle water ripples, slow wind blowing foliage, dramatic volumetric smoke drifting...)"
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Prompt enhancer button */}
        {activeTab === "text" && (
          <button
            id="enhance-prompt-btn"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            className="self-end py-1.5 px-3 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-40 disabled:bg-transparent rounded-lg text-xs font-medium text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Enhance with AI
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. Image to Video drag and drop container */}
      {activeTab === "image" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400 font-semibold">Starting Keyframe</span>
          
          {imagePreview ? (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-black group">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                id="clear-image-btn"
                onClick={handleClearImage}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              id="image-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[16/9] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                isDragging 
                  ? "border-indigo-500 bg-indigo-500/5 text-indigo-300" 
                  : "border-white/10 hover:border-white/25 text-gray-400 hover:text-gray-300 bg-black/20"
              }`}
            >
              <Camera className="w-8 h-8 mb-2 text-indigo-400/80" />
              <p className="text-xs font-semibold text-white">Drag &amp; Drop or Browse</p>
              <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Quick starter templates */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Modèles de démarrage :</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Portail Sci-Fi", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop" },
                { name: "Vallée Magique", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop" },
                { name: "Rue Cyberpunk", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" }
              ].map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(tmpl.url);
                  }}
                  className="relative rounded-lg overflow-hidden h-12 border border-white/5 hover:border-indigo-500/50 group cursor-pointer transition-all"
                >
                  <img src={tmpl.url} alt={tmpl.name} className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-1 inset-x-1 text-[8px] font-semibold text-white truncate text-center bg-black/60 py-0.5 rounded">
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Style Selection panel */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-semibold">Artistic Theme Style</span>
          
          {/* Horizontal mini filter selectors */}
          <div className="flex gap-1.5 bg-black/30 p-0.5 rounded border border-white/5">
            {["All", "Cinematic", "Realistic", "Anime/Art", "3D/Pixar"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer font-medium ${
                  categoryFilter === cat ? "bg-zinc-800 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {cat.split("/")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Styles flex box */}
        <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
          {stylesFiltered.map((style) => (
            <button
              id={`style-btn-${style.id}`}
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative rounded-lg overflow-hidden border aspect-square flex flex-col items-center justify-end p-2 text-center group cursor-pointer transition-all ${
                selectedStyle === style.id
                  ? "border-indigo-500 shadow shadow-indigo-500/30"
                  : "border-white/5 hover:border-white/15"
              }`}
            >
              <img
                src={style.thumbnailUrl}
                alt={style.name}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              
              {/* Highlighter circle */}
              {selectedStyle === style.id && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" />
              )}
              
              <span className="relative z-10 text-[9px] font-semibold text-white leading-tight truncate w-full">
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Fine-tuning details settings */}
      <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5" /> Motion &amp; Lens Fine-tuning
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Aspect ratio selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Aspect Ratio</span>
            <select
              id="ratio-select"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="16:9">16:9 Landscape</option>
              <option value="9:16">9:16 Vertical</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:3">4:3 Classic</option>
            </select>
          </div>

          {/* Camera movement selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Camera Track</span>
            <select
              id="camera-select"
              value={cameraMovement}
              onChange={(e) => setCameraMovement(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="Slow Zoom In">Slow Zoom In</option>
              <option value="Slow Zoom Out">Slow Zoom Out</option>
              <option value="Pan Left">Pan Left</option>
              <option value="Pan Right">Pan Right</option>
              <option value="Tilt Up">Tilt Up</option>
              <option value="Tilt Down">Tilt Down</option>
              <option value="Orbit Left">Orbit Left</option>
              <option value="Orbit Right">Orbit Right</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Clip Duration */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Duration</span>
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
              {[4, 8].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDuration(sec)}
                  className={`flex-1 py-1 text-[10px] font-semibold rounded cursor-pointer ${
                    duration === sec ? "bg-zinc-800 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Motion Strength */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Motion Speed</span>
            <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
              {(["low", "medium", "high"] as const).map((strength) => (
                <button
                  key={strength}
                  type="button"
                  onClick={() => setMotionStrength(strength)}
                  className={`flex-1 py-1 text-[9px] uppercase font-semibold rounded cursor-pointer ${
                    motionStrength === strength ? "bg-zinc-800 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {strength}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Credits dashboard & main CTA action */}
      <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-500">Clip Cost</span>
          <span className="text-indigo-400 font-semibold">{creditCost} credits</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-500">Remaining</span>
          <span className="text-green-400 font-semibold">{credits} credits</span>
        </div>

        {/* Dynamic warning if low on credits */}
        {credits < creditCost && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-300 leading-normal">
              Insufficient credits. Renderings recharge automatically hourly.
            </p>
          </div>
        )}

        <button
          id="generate-video-btn"
          onClick={handleGenerateClick}
          disabled={isGenerating || (activeTab === "text" && !prompt.trim()) || (activeTab === "image" && !imagePreview) || credits < creditCost}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-900 disabled:to-purple-900 text-white font-semibold text-sm cursor-pointer shadow-lg hover:shadow-indigo-500/20 disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Rendering Cinematic Clip...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 fill-current" /> Create Motion Clip
            </>
          )}
        </button>
      </div>

    </div>
  );
}
