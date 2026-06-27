import React from "react";
import { Play, Sparkles, RefreshCw, Eye, Calendar, Clock } from "lucide-react";
import { MOCK_GALLERY } from "../data";
import { VideoTask } from "../types";

interface GalleryProps {
  onSelectTask: (task: VideoTask) => void;
  onRemix: (config: {
    prompt: string;
    style: string;
    aspectRatio: string;
    duration: number;
    motionStrength: 'low' | 'medium' | 'high';
    cameraMovement: string;
    keyframeUrl: string;
    audioAtmosphere: string;
  }) => void;
  userTasks: VideoTask[];
}

export default function Gallery({ onSelectTask, onRemix, userTasks }: GalleryProps) {
  // Combine user tasks with preloaded creations
  const mockTasks: VideoTask[] = MOCK_GALLERY.map((g) => ({
    id: g.id,
    status: "completed",
    progress: 100,
    currentStage: "Completed",
    config: {
      prompt: g.prompt,
      style: g.style,
      aspectRatio: g.aspectRatio,
      duration: g.duration,
      motionStrength: g.motionStrength,
      cameraMovement: g.cameraMovement,
    },
    keyframeUrl: g.keyframeUrl,
    audioAtmosphere: g.audioAtmosphere,
    createdAt: new Date().toLocaleDateString(),
  }));

  const allCreations = [...userTasks.filter((t) => t.status === "completed"), ...mockTasks];

  return (
    <div id="gallery-showcase" className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Inspire Showcase
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Explore high-quality community-grade visual motions. Click to play with synchronized sound synths or remix prompts.
          </p>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {allCreations.length} Creations
        </span>
      </div>

      {allCreations.length === 0 ? (
        <div className="border border-dashed border-white/5 rounded-xl p-10 text-center text-gray-500">
          <p className="text-sm">No creations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCreations.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/5 flex flex-col hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
            >
              {/* Media Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={item.keyframeUrl}
                  alt={item.config.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Darkened visual mask */}
                <div className="absolute inset-0 bg-black/40 opacity-100 group-hover:bg-black/60 transition-colors duration-300" />

                {/* Overlaid badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-mono bg-indigo-600/90 text-white px-2 py-0.5 rounded backdrop-blur-sm border border-indigo-500/20">
                    {item.config.style || "Realistic"}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  <span className="text-[9px] font-mono bg-black/60 text-gray-300 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {item.config.duration}s
                  </span>
                </div>

                {/* Dynamic center Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button
                    id={`gallery-play-${item.id}`}
                    onClick={() => onSelectTask(item)}
                    className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    title="Load into Cinematic Canvas"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Text content details sheet */}
              <div className="p-4 flex flex-col gap-3 flex-grow">
                <div>
                  <p className="text-xs text-gray-300 font-medium line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                    &ldquo;{item.config.prompt}&rdquo;
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Camera track</span>
                    <span className="text-xs font-semibold text-gray-300">{item.config.cameraMovement || "Slow Zoom"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`gallery-remix-${item.id}`}
                      onClick={() => onRemix({
                        prompt: item.config.prompt,
                        style: item.config.style,
                        aspectRatio: item.config.aspectRatio,
                        duration: item.config.duration,
                        motionStrength: item.config.motionStrength,
                        cameraMovement: item.config.cameraMovement,
                        keyframeUrl: item.keyframeUrl || "",
                        audioAtmosphere: item.audioAtmosphere || ""
                      })}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Remix Settings"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`gallery-view-${item.id}`}
                      onClick={() => onSelectTask(item)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Load Canvas"
                    >
                      <Eye className="w-3.5 h-3.5" /> Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
