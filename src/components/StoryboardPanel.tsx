import React, { useState } from "react";
import { Sparkles, Play, Film, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Storyboard, StoryboardScene } from "../types";

interface StoryboardPanelProps {
  onQueueScene: (scene: StoryboardScene) => void;
  isLoading: boolean;
  onGenerateStoryboard: (concept: string) => Promise<void>;
  storyboard: Storyboard | null;
}

export default function StoryboardPanel({ onQueueScene, isLoading, onGenerateStoryboard, storyboard }: StoryboardPanelProps) {
  const [concept, setConcept] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    onGenerateStoryboard(concept);
  };

  return (
    <div id="storyboard-panel" className="w-full bg-zinc-950/40 rounded-xl border border-white/5 p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Film className="w-5 h-5 text-indigo-400" /> Multi-Scene Director
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Let Gemini AI script a fully coordinated, multi-scene video storyboard from a single storyline idea.
          </p>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono font-semibold">
          AI Scripting
        </span>
      </div>

      {/* Idea script input form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input 
          id="storyboard-concept-input"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="E.g., A cyberpunk detective chasing a glowing anomaly through neon Tokyo streets..."
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={isLoading}
        />
        <button
          id="generate-storyboard-btn"
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          disabled={isLoading || !concept.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Scripting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Script Scenes
            </>
          )}
        </button>
      </form>

      {/* Display Storyboard details */}
      {storyboard ? (
        <div className="flex flex-col gap-5">
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <span className="text-xs font-mono text-indigo-400 uppercase">Director Storyline Concept</span>
            <p className="text-sm font-medium text-white mt-1">
              &ldquo;{storyboard.concept}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storyboard.scenes.map((scene) => (
              <div 
                key={scene.sceneNumber}
                className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    Scene {scene.sceneNumber}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {scene.duration}s
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-200">
                    {scene.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-4 leading-relaxed">
                    {scene.visualPrompt}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Camera: <strong className="text-gray-300 font-mono">{scene.cameraMovement}</strong></span>
                    <span>Music: <strong className="text-gray-300 font-mono">{scene.musicAtmosphere}</strong></span>
                  </div>

                  <button
                    id={`queue-scene-${scene.sceneNumber}-btn`}
                    onClick={() => onQueueScene(scene)}
                    className="w-full py-1.5 mt-1 bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-300 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" /> Render Scene
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-white/5 rounded-xl p-8 text-center text-gray-500">
          <Film className="w-8 h-8 mx-auto text-white/15 mb-2" />
          <p className="text-sm text-gray-400">No active storyboard generated.</p>
          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
            Input an overall narrative idea above, and Gemini AI will structure it into a beautifully sequential 3-scene storyboard.
          </p>
        </div>
      )}
    </div>
  );
}
