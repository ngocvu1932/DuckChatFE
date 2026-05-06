import {faPause, faPlay} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useMemo, useRef, useState} from 'react';

interface IAudioMessageProps {
  src: string;
  isSender: boolean;
}

const AudioMessage = ({src, isSender}: IAudioMessageProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const bars = useMemo(() => {
    return Array.from({length: 20}).map(() => Math.random() * 100);
  }, []);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = duration - currentTime;

  const animationStyle = isPlaying
    ? {
        animationName: 'wave',
        animationDuration: `${0.8 + Math.random() * 0.4}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      }
    : {};

  return (
    <div className={`flex items-center gap-3 ${isSender ? 'text-white' : 'text-black'}`}>
      {/* audio hidden */}
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* play button */}
      <button
        onClick={togglePlay}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 transition"
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="text-sm" />
      </button>

      {/* waveform giả */}
      <div className="flex items-end gap-[2px] h-5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[2px] bg-current opacity-70"
            style={{
              height: `${h}%`,
              ...animationStyle,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* countdown */}
      {isPlaying && <span className="text-[11px] opacity-90">-{formatTime(remaining)}</span>}
    </div>
  );
};

export default AudioMessage;
