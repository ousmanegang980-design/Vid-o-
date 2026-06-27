import React, { useState, useEffect } from "react";
import { Sparkles, Film, Play, Eye, Flame, Moon, HelpCircle, MonitorPlay, MessageSquare, Compass, Info, LogOut, Youtube } from "lucide-react";
import Sidebar from "./components/Sidebar";
import VideoPlayer from "./components/VideoPlayer";
import StoryboardPanel from "./components/StoryboardPanel";
import Gallery from "./components/Gallery";
import YouTubeClipper from "./components/YouTubeClipper";
import { VideoGenerationConfig, VideoTask, Storyboard, StoryboardScene } from "./types";

export default function App() {
  const [activeTask, setActiveTask] = useState<VideoTask | null>(null);
  const [userTasks, setUserTasks] = useState<VideoTask[]>([]);
  const [credits, setCredits] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active tab state to switch between Generative Cinematic Studio and YouTube to Shorts Clipper
  const [activeTab, setActiveTab] = useState<"clipper" | "cinematic">("clipper");

  // Storyboard state
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [storyboardLoading, setStoryboardLoading] = useState(false);

  // Check backend server connection on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        console.log("Backend status:", data);
      } catch (err) {
        console.warn("Backend server not reached yet:", err);
      }
    }
    checkHealth();
  }, []);

  // Handle video generation and realistic progress pipeline simulation
  const handleGenerateVideo = async (config: VideoGenerationConfig) => {
    setIsGenerating(true);
    setCredits((prev) => Math.max(0, prev - (config.duration === 8 ? 8 : 4)));

    // Create unique task id
    const taskId = "task_" + Math.random().toString(36).substring(2, 9);
    
    // Create initial task state
    const newTask: VideoTask = {
      id: taskId,
      status: "queued",
      progress: 5,
      currentStage: "Initiating video pipeline...",
      config,
      createdAt: new Date().toLocaleTimeString(),
    };

    setActiveTask(newTask);
    setUserTasks((prev) => [newTask, ...prev]);

    // Stage 1: Analyzing Prompt
    await delay(1000);
    updateTaskStage(taskId, "analyzing", 20, "Analyzing prompt recipe with Gemini AI...");

    // Stage 2: Formulating Keyframes
    await delay(1500);
    updateTaskStage(taskId, "generating_frames", 55, "Formulating high-definition keyframes...");

    try {
      // Fetch visual keyframe and assets from fullstack express server
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      // Stage 3: Interpolating Frame Transitions
      updateTaskStage(taskId, "interpolating", 85, "Interpolating dynamic frame transitions...");
      await delay(1200);

      const completedTask: VideoTask = {
        id: taskId,
        status: "completed",
        progress: 100,
        currentStage: "Completed",
        config,
        keyframeUrl: data.keyframeUrl,
        audioAtmosphere: data.audioAtmosphere || "Ambient cinematic pad",
        createdAt: new Date().toLocaleTimeString(),
      };

      // Set completed state
      setActiveTask(completedTask);
      setUserTasks((prev) => prev.map((t) => (t.id === taskId ? completedTask : t)));

    } catch (err: any) {
      console.error("Error generating video clip:", err);
      const failedTask: VideoTask = {
        id: taskId,
        status: "failed",
        progress: 100,
        currentStage: "Failed",
        config,
        error: "Generation pipeline interrupted",
        createdAt: new Date().toLocaleTimeString(),
      };
      setActiveTask(failedTask);
      setUserTasks((prev) => prev.map((t) => (t.id === taskId ? failedTask : t)));
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate 3-Scene Storyboard with Gemini AI
  const handleGenerateStoryboard = async (concept: string) => {
    setStoryboardLoading(true);
    try {
      const response = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      const data = await response.json();
      if (data.storyboard) {
        setStoryboard(data.storyboard);
      }
    } catch (err) {
      console.error("Failed to script storyboard:", err);
    } finally {
      setStoryboardLoading(false);
    }
  };

  // Queue a single storyboard scene directly into video pipeline
  const handleQueueStoryboardScene = (scene: StoryboardScene) => {
    const config: VideoGenerationConfig = {
      prompt: scene.visualPrompt,
      style: "National Geo Nature", // generic style, can be adjusted
      aspectRatio: "16:9",
      duration: scene.duration,
      motionStrength: "medium",
      cameraMovement: scene.cameraMovement,
    };
    handleGenerateVideo(config);
  };

  // Helper function to update active task stage
  const updateTaskStage = (
    taskId: string,
    status: VideoTask["status"],
    progress: number,
    stageText: string
  ) => {
    setUserTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status, progress, currentStage: stageText };
          setActiveTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Export frame handler
  const handleExportFrame = (task: VideoTask) => {
    if (!task.keyframeUrl) return;
    const link = document.createElement("a");
    link.href = task.keyframeUrl;
    link.download = `WayInVideo_${task.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load showcase item back into sidebar inputs for tweaking
  const handleRemix = (remixConfig: any) => {
    const textarea = document.getElementById("prompt-textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = remixConfig.prompt;
      // trigger input event to sync state
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);
    }

    const ratioSelect = document.getElementById("ratio-select") as HTMLSelectElement;
    if (ratioSelect) {
      ratioSelect.value = remixConfig.aspectRatio;
      ratioSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const cameraSelect = document.getElementById("camera-select") as HTMLSelectElement;
    if (cameraSelect) {
      cameraSelect.value = remixConfig.cameraMovement;
      cameraSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Load pre-rendered mock as the active video player view so they can instantly preview it!
    const loadedTask: VideoTask = {
      id: "remixed_" + Math.random().toString(36).substring(2, 9),
      status: "completed",
      progress: 100,
      currentStage: "Completed",
      config: {
        prompt: remixConfig.prompt,
        style: remixConfig.style,
        aspectRatio: remixConfig.aspectRatio,
        duration: remixConfig.duration,
        motionStrength: remixConfig.motionStrength,
        cameraMovement: remixConfig.cameraMovement,
      },
      keyframeUrl: remixConfig.keyframeUrl,
      audioAtmosphere: remixConfig.audioAtmosphere || "Soundtrack Synth",
      createdAt: new Date().toLocaleTimeString(),
    };
    setActiveTask(loadedTask);
  };

  return (
    <div id="wayin-app-root" className="min-h-screen bg-[#030305] text-gray-100 flex flex-col relative overflow-hidden">
      
      {/* Background ambient lighting glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none ambient-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none ambient-glow" />

      {/* Main HUD Nav bar */}
      <header className="sticky top-0 z-40 bg-[#030305]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
              WayIn Video <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-bold">Studio</span>
            </h1>
          </div>
        </div>

        {/* User telemetry metrics */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300 font-mono">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>ousmanegang980@gmail.com</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Flame className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span>120 Credits</span>
          </div>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 pt-6 flex justify-center sm:justify-start">
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5 shadow-inner">
          <button
            id="tab-select-clipper"
            onClick={() => setActiveTab("clipper")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "clipper"
                ? "bg-red-600 text-white shadow-md shadow-red-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Youtube className="w-4 h-4" /> YouTube en Shorts / TikTok
          </button>
          
          <button
            id="tab-select-cinematic"
            onClick={() => setActiveTab("cinematic")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "cinematic"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Studio Cinématique Text-to-Video
          </button>
        </div>
      </div>

      {/* Conditionally rendered layouts based on Active Tab */}
      {activeTab === "cinematic" ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left column configuration suit */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <Sidebar 
              onGenerate={handleGenerateVideo}
              isGenerating={isGenerating}
              credits={credits}
            />
          </section>

          {/* Right column active workspace */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            {/* Active video stage player */}
            <VideoPlayer 
              task={activeTask}
              onDownload={handleExportFrame}
            />

            {/* Script director storyboard suite */}
            <StoryboardPanel 
              isLoading={storyboardLoading}
              onGenerateStoryboard={handleGenerateStoryboard}
              storyboard={storyboard}
              onQueueScene={handleQueueStoryboardScene}
            />

            {/* Creations and templates showcase */}
            <Gallery 
              onSelectTask={(task) => {
                setActiveTab("cinematic");
                setActiveTask(task);
              }}
              onRemix={handleRemix}
              userTasks={userTasks}
            />
          </section>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col gap-8 relative z-10">
          {/* YouTube Clipper Suite */}
          <YouTubeClipper 
            onAddShortToUserShowcase={(newShort) => {
              setUserTasks((prev) => [newShort, ...prev]);
            }}
          />

          {/* Gallery display underneath to easily view, play or manage created items */}
          <Gallery 
            onSelectTask={(task) => {
              setActiveTab("cinematic");
              setActiveTask(task);
            }}
            onRemix={handleRemix}
            userTasks={userTasks}
          />
        </main>
      )}

      {/* Sleek aesthetic footer */}
      <footer className="border-t border-white/5 py-6 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 mt-auto bg-black/40 relative z-10 gap-4">
        <p>&copy; 2026 WayIn Video Workspace. Cinematic AI text-to-video creative generator.</p>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="flex items-center gap-1"><Info className="w-3 h-3 text-indigo-400" /> Powered by Gemini-3.5-Flash</span>
          <span>● Online</span>
        </div>
      </footer>

    </div>
  );
}
