import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles, Sliders, MonitorPlay, Maximize2 } from "lucide-react";
import { VideoTask } from "../types";

interface VideoPlayerProps {
  task: VideoTask | null;
  onDownload?: (task: VideoTask) => void;
}

export default function VideoPlayer({ task, onDownload }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loop, setLoop] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRefs = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const duration = task?.config.duration || 4;
  const timerRef = useRef<any>(null);

  // Synced timing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return Math.min(prev + 0.05, duration);
        });
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, loop]);

  // Restart time when task changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [task]);

  // Canvas-based real-time video environmental FX
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; speedY: number; speedX: number; size: number; opacity: number; color: string }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles based on style
    const style = task?.config.style?.toLowerCase() || "";
    const particleCount = style.includes("cyberpunk") ? 40 : style.includes("anime") ? 25 : style.includes("fantasy") ? 35 : 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedY: (Math.random() * 0.8 + 0.2) * (style.includes("fantasy") ? -1 : 1), // drift up for fantasy
        speedX: Math.random() * 0.4 - 0.2,
        size: Math.random() * (style.includes("cyberpunk") ? 3 : 5) + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: style.includes("cyberpunk") 
          ? (Math.random() > 0.5 ? "rgba(255, 0, 128, " : "rgba(0, 240, 255, ")
          : style.includes("anime")
          ? "rgba(255, 182, 193, " // cherry petals
          : style.includes("fantasy")
          ? "rgba(168, 85, 247, " // purple magic
          : "rgba(255, 255, 255, " // golden dust
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Draw floating atmosphere elements
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.shadowBlur = style.includes("cyberpunk") || style.includes("fantasy") ? 10 : 0;
          ctx.shadowColor = style.includes("cyberpunk") ? "#ff0080" : "#a855f7";
          ctx.fill();

          // Movement
          p.y += p.speedY * (task?.config.motionStrength === "high" ? 1.8 : task?.config.motionStrength === "low" ? 0.6 : 1);
          p.x += p.speedX;

          // Boundary checks
          if (p.y > canvas.height) p.y = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });

        // Overlay light leaks
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.2, canvas.height * 0.2, 5,
          canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.5
        );
        if (style.includes("cyberpunk")) {
          gradient.addColorStop(0, "rgba(255, 0, 128, 0.08)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          gradient.addColorStop(0, "rgba(253, 224, 71, 0.06)"); // amber sunset
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyberpunk Scanlines
        if (style.includes("cyberpunk")) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
          ctx.lineWidth = 1;
          for (let y = 0; y < canvas.height; y += 4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, task]);

  // Web Audio Synth for ambient soundtrack
  const initAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = isMuted ? 0 : 0.15;
      gainNodeRef.current = masterGain;

      // Base pad drone synth
      const style = task?.config.style?.toLowerCase() || "";
      let frequencies = [110, 165, 220]; // A2, E3, A3 (Warm standard drone)

      if (style.includes("cyberpunk")) {
        frequencies = [82.4, 123.5, 164.8]; // E2, B2, E3 (Dark retro)
      } else if (style.includes("anime") || style.includes("watercolor")) {
        frequencies = [130.8, 196.0, 261.6]; // C3, G3, C4 (Peaceful chord)
      }

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        // Smooth warm sawtooth or triangle
        osc.type = style.includes("cyberpunk") ? "sawtooth" : "triangle";
        osc.frequency.value = freq;

        // Biquad filter to make it lush
        filter.type = "lowpass";
        filter.frequency.value = 600 + idx * 100;
        filter.Q.value = 2;

        // LFO for sweet moving sweep filter
        lfo.frequency.value = 0.1 + idx * 0.05;
        lfoGain.gain.value = 200;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        osc.connect(filter);
        filter.connect(masterGain);

        osc.start();
        lfo.start();

        oscillatorRefs.current.push(osc);
        oscillatorRefs.current.push(lfo);
      });
    } catch (err) {
      console.error("Failed to initialize Web Audio:", err);
    }
  };

  const stopAudio = () => {
    oscillatorRefs.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorRefs.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextMute ? 0 : 0.15, audioCtxRef.current?.currentTime || 0);
    } else if (!nextMute && isPlaying) {
      initAudio();
    }
  };

  const handlePlayToggle = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (nextPlay) {
      if (!isMuted && !audioCtxRef.current) {
        initAudio();
      }
    } else {
      stopAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Sync mute state changes to synthesizer
  useEffect(() => {
    if (isPlaying && !isMuted && !audioCtxRef.current) {
      initAudio();
    } else if (isMuted) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      }
    } else if (!isMuted && gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(0.15, audioCtxRef.current?.currentTime || 0);
    }
  }, [isMuted, isPlaying]);

  // Aspect ratio class mapper
  const getAspectRatioClass = () => {
    const ratio = task?.config.aspectRatio || "16:9";
    switch (ratio) {
      case "9:16":
        return "aspect-[9/16] max-h-[500px]";
      case "1:1":
        return "aspect-square max-h-[440px]";
      case "4:3":
        return "aspect-[4/3] max-h-[440px]";
      default:
        return "aspect-[16/9]";
    }
  };

  // Ken burns camera movement CSS generator
  const getCameraStyle = () => {
    if (!isPlaying) return { transform: "scale(1)", transition: "transform 0.5s ease" };

    const movement = (task?.config.cameraMovement || "Slow Zoom In").toLowerCase();
    const strength = (task?.config.motionStrength || "medium").toLowerCase();
    const progressPercent = currentTime / duration;

    // Scale and offset boundaries driven by configuration intensity
    let scaleMult = 0.15; // default medium
    let offsetMult = 6;   // default medium

    if (strength === "high") {
      scaleMult = 0.35;
      offsetMult = 15;
    } else if (strength === "low") {
      scaleMult = 0.04;
      offsetMult = 1.5;
    }

    const scale = 1 + scaleMult * progressPercent;
    const inverseScale = (1 + scaleMult) - scaleMult * progressPercent;
    const offset = offsetMult * progressPercent; // percent displacement

    if (movement.includes("zoom in")) {
      return {
        transform: `scale(${scale})`,
        transformOrigin: "center center"
      };
    } else if (movement.includes("zoom out")) {
      return {
        transform: `scale(${inverseScale})`,
        transformOrigin: "center center"
      };
    } else if (movement.includes("pan left")) {
      return {
        transform: `scale(${1 + scaleMult * 0.5}) translateX(${offset}%)`,
        transformOrigin: "right center"
      };
    } else if (movement.includes("pan right")) {
      return {
        transform: `scale(${1 + scaleMult * 0.5}) translateX(${-offset}%)`,
        transformOrigin: "left center"
      };
    } else if (movement.includes("tilt up")) {
      return {
        transform: `scale(${1 + scaleMult * 0.5}) translateY(${offset}%)`,
        transformOrigin: "center bottom"
      };
    } else if (movement.includes("tilt down")) {
      return {
        transform: `scale(${1 + scaleMult * 0.5}) translateY(${-offset}%)`,
        transformOrigin: "center top"
      };
    } else if (panningMovement(movement)) {
      // orbit/slide
      return {
        transform: `scale(${scale}) rotate(${progressPercent * (strength === "high" ? 6 : strength === "low" ? 1 : 3)}deg)`,
        transformOrigin: "center center"
      };
    }

    return {
      transform: `scale(${scale})`,
      transformOrigin: "center center"
    };
  };

  const panningMovement = (move: string) => {
    return move.includes("orbit") || move.includes("slide") || move.includes("crane");
  };

  const getDisplacementScale = () => {
    const strength = (task?.config.motionStrength || "medium").toLowerCase();
    if (strength === "high") return 25;
    if (strength === "low") return 6;
    return 14;
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div id="video-player-component" className="w-full flex flex-col gap-5">
      {/* Cinematic Preview Stage Container */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-white/5 shadow-2xl flex items-center justify-center transition-all duration-300"
      >
        {task ? (
          <div className={`relative w-full overflow-hidden flex items-center justify-center ${getAspectRatioClass()}`}>
            {/* Base Visual Keyframe layer with Camera motion and fluid liquid-wave animation */}
            <img 
              src={task.keyframeUrl} 
              alt={task.config.prompt} 
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-75 ease-out"
              style={{
                ...getCameraStyle(),
                filter: isPlaying ? "url(#liquid-motion-displacement)" : "none"
              }}
              referrerPolicy="no-referrer"
            />

            {/* Environmental real-time FX Overlays */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Ambient Darkened Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />

            {/* Rendering Overlay */}
            {task.status !== "completed" && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-30 p-6 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto text-indigo-400 w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white font-display">
                    {task.currentStage}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1 max-w-sm">
                    {task.config.prompt}
                  </p>
                </div>
                {/* Generation Timeline Simulation Bar */}
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-indigo-400">{task.progress}% rendered</span>
              </div>
            )}

            {/* Big center Play button overlay on idle */}
            {!isPlaying && task.status === "completed" && (
              <button 
                id="center-play-button"
                onClick={handlePlayToggle}
                className="absolute z-20 w-20 h-20 rounded-full bg-white/10 hover:bg-indigo-500 hover:scale-105 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all duration-300 text-white shadow-xl cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}

            {/* Bottom HUD bar on top of the video player */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 flex flex-col gap-2 pointer-events-auto opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
              
              {/* Scrubbing timeline */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">
                  {currentTime.toFixed(1)}s
                </span>
                <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden group cursor-pointer">
                  <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500 group-hover:bg-indigo-400"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {duration.toFixed(1)}s
                </span>
              </div>

              {/* Player control hotkey rail */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    id="hud-play-pause"
                    onClick={handlePlayToggle}
                    className="text-white hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button 
                    id="hud-reset"
                    onClick={() => setCurrentTime(0)}
                    className="text-white hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    id="hud-mute-toggle"
                    onClick={toggleMute}
                    className="text-white hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
                    <span className="text-[10px] font-mono text-gray-400 max-w-[80px] truncate hidden md:inline">
                      {isMuted ? "Muted" : task.audioAtmosphere || "Soundtrack"}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="hud-loop-toggle"
                    onClick={() => setLoop(!loop)}
                    className={`text-xs px-2 py-0.5 rounded font-mono border transition-all cursor-pointer ${
                      loop ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-transparent border-white/10 text-gray-400"
                    }`}
                  >
                    LOOP
                  </button>
                  <button 
                    id="hud-fullscreen"
                    onClick={handleFullscreenToggle}
                    className="text-white hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  {onDownload && (
                    <button 
                      id="hud-download"
                      onClick={() => onDownload(task)}
                      className="text-white hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Export Cinematic Frame"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty/Idle State display when no video is loaded */
          <div className="aspect-[16/9] w-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <MonitorPlay className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 font-display">Cinematic Canvas Empty</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Formulate your prompts, choose camera tracks and generate, or choose a creation from the showcase gallery.
            </p>
          </div>
        )}
      </div>

      {/* Generation metadata dashboard */}
      {task && task.status === "completed" && (
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                Style: {task.config.style || "Realistic Cinematic"}
              </span>
              <h3 className="text-base font-semibold text-white mt-2 leading-relaxed">
                {task.config.prompt}
              </h3>
            </div>
            {onDownload && (
              <button
                id="meta-download-btn"
                onClick={() => onDownload(task)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Export Frame
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/5">
            <div>
              <span className="text-xs text-gray-400">Duration</span>
              <p className="text-sm font-semibold text-white font-mono mt-0.5">{task.config.duration} seconds</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Aspect Ratio</span>
              <p className="text-sm font-semibold text-white font-mono mt-0.5">{task.config.aspectRatio}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Camera Movement</span>
              <p className="text-sm font-semibold text-white font-mono mt-0.5">{task.config.cameraMovement}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Motion Strength</span>
              <p className="text-sm font-semibold text-white capitalize font-mono mt-0.5">{task.config.motionStrength}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden SVG Displacement filter for organic liquid video motion */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} width="0" height="0">
        <defs>
          <filter id="liquid-motion-displacement">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" result="noise">
              <animate attributeName="baseFrequency" dur="15s" values="0.005 0.005; 0.012 0.02; 0.005 0.005" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={getDisplacementScale()} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
