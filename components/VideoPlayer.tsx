'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, FastForward } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({ src, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    if (onTimeUpdate) {
      onTimeUpdate(cur, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: '#090d16',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        border: '1px solid #1e293b'
      }}
    >
      {/* Main Video Viewport */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
        <video
          ref={videoRef}
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      </div>

      {/* Control Bar */}
      <div
        style={{
          padding: '12px 16px',
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {/* Progress Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', width: 45 }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 5,
              accentColor: '#6366f1',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', width: 45 }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Play, Rewind, Fast Forward Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => handleSkip(-10)}
              title="Rewind 10 Seconds"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#e2e8f0',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={14} /> -10s
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              style={{
                background: '#6366f1',
                border: 0,
                color: '#fff',
                padding: '8px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => handleSkip(10)}
              title="Fast-Forward 10 Seconds"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#e2e8f0',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              +10s <RotateCw size={14} />
            </button>
          </div>

          {/* Speed & Volume Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FastForward size={14} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginRight: 4 }}>SPEED:</span>
              <div style={{ display: 'flex', gap: 3, background: '#1e293b', padding: 2, borderRadius: 6, border: '1px solid #334155' }}>
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    style={{
                      padding: '3px 7px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      border: 0,
                      cursor: 'pointer',
                      background: playbackRate === rate ? '#6366f1' : 'transparent',
                      color: playbackRate === rate ? '#fff' : '#cbd5e1',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              style={{
                background: 'transparent',
                border: 0,
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'transparent',
                border: 0,
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
              title="Fullscreen"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
