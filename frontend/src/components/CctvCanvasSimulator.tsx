import React, { useEffect, useState, useRef } from 'react';
import { Video, Activity, RefreshCcw } from 'lucide-react';

interface CctvCanvasSimulatorProps {
  cameraName: string;
  highway: string;
  speed: string;
  lat: number;
  lng: number;
}

// Local Real Highway Stock Video Footage (Downloaded in public/videos/highway-samples/)
const LOCAL_HIGHWAY_VIDEOS = [
  '/videos/highway-samples/highway-01.mp4',
  '/videos/highway-samples/highway-02.mp4',
  '/videos/highway-samples/highway-03.mp4'
];

export const CctvCanvasSimulator: React.FC<CctvCanvasSimulatorProps> = ({
  cameraName,
  highway,
  speed,
  lat,
  lng
}) => {
  const [feedMode, setFeedMode] = useState<'video' | 'telemetry'>('video');
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pick video file based on camera selection
  const currentVideoSrc = LOCAL_HIGHWAY_VIDEOS[videoIndex % LOCAL_HIGHWAY_VIDEOS.length];

  // Live Timestamp Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      const timePart = now.toTimeString().split(' ')[0];
      setTimestamp(`${datePart} ${timePart}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Telemetry Radar Canvas Renderer (Optionally toggled via Radar Telemetry mode)
  useEffect(() => {
    if (feedMode !== 'telemetry' && !videoError) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let frameCount = 0;

    const vehicles = [
      { y: 0.2, speed: 0.003, color: '#38BDF8', size: 14, lane: -1 },
      { y: 0.5, speed: 0.004, color: '#F59E0B', size: 18, lane: 1 },
      { y: 0.8, speed: 0.0025, color: '#EF4444', size: 16, lane: -1 },
      { y: 0.35, speed: 0.0045, color: '#10B981', size: 12, lane: 1 }
    ];

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width * 0.2, height * 0.25);
      ctx.lineTo(width * 0.4, height * 0.4);
      ctx.lineTo(width * 0.65, height * 0.18);
      ctx.lineTo(width * 0.85, height * 0.35);
      ctx.lineTo(width, height * 0.22);
      ctx.lineTo(width, height * 0.5);
      ctx.lineTo(0, height * 0.5);
      ctx.closePath();
      ctx.fill();

      const horizonY = height * 0.45;
      const roadBottomWidth = width * 0.75;
      const roadTopWidth = width * 0.12;

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(width / 2 - roadTopWidth / 2, horizonY);
      ctx.lineTo(width / 2 + roadTopWidth / 2, horizonY);
      ctx.lineTo(width / 2 + roadBottomWidth / 2, height);
      ctx.lineTo(width / 2 - roadBottomWidth / 2, height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 12]);
      ctx.lineDashOffset = -frameCount * 1.5;

      ctx.beginPath();
      ctx.moveTo(width / 2, horizonY);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      vehicles.forEach(v => {
        v.y += v.speed;
        if (v.y > 1) v.y = 0.1;

        const curY = horizonY + (height - horizonY) * v.y;
        const scale = 0.1 + v.y * 0.9;
        const curWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * v.y;
        const curX = width / 2 + (v.lane * curWidth * 0.25);

        const glowGradient = ctx.createRadialGradient(curX, curY, 2, curX, curY, 25 * scale);
        glowGradient.addColorStop(0, v.color);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(curX, curY, 25 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = v.color;
        ctx.fillRect(curX - (v.size * scale) / 2, curY - (v.size * scale) / 2, v.size * scale, v.size * scale * 0.7);
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [feedMode, videoError, speed]);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Mode & Channel Controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center space-x-1.5 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-2xl">
        <button
          onClick={() => { setFeedMode('video'); setVideoError(false); }}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            feedMode === 'video' && !videoError
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Real Highway Footage</span>
        </button>

        <button
          onClick={() => setVideoIndex(prev => prev + 1)}
          className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 border border-slate-700"
          title="Switch Highway Camera Angle"
        >
          <RefreshCcw className="w-3 h-3 text-cyan-400" />
          <span>Clip #{videoIndex % LOCAL_HIGHWAY_VIDEOS.length + 1}</span>
        </button>

        <button
          onClick={() => setFeedMode('telemetry')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            feedMode === 'telemetry'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Radar Telemetry</span>
        </button>
      </div>

      {/* REAL HIGHWAY FOOTAGE VIDEO PLAYER */}
      {feedMode === 'video' && !videoError ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            key={currentVideoSrc}
            src={currentVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover min-h-[300px]"
          />

          {/* CCTV HUD Telemetry Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border-2 border-emerald-500/30 rounded-lg">
            
            {/* Top Left Badge */}
            <div className="flex items-center space-x-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold w-fit shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>📹 REPRESENTATIVE HIGHWAY FOOTAGE • {cameraName}</span>
            </div>

            {/* Bottom Left Timestamp & Telemetry */}
            <div className="bg-black/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-xs font-mono text-cyan-300 w-fit space-y-0.5 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-red-400 font-extrabold">● REC 1080p 60FPS</span>
                <span>{timestamp}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                HWY: {highway || 'NH-10'} | LAT: {lat.toFixed(4)}°N LON: {lng.toFixed(4)}°E | SPEED: {speed}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* RADAR TELEMETRY SCANNER */
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/40 flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>📡 TELEMETRY RADAR STREAM • {highway || cameraName}</span>
          </div>
        </div>
      )}

    </div>
  );
};
