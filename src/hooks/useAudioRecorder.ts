import {useRef, useState} from 'react';

type RecorderState = 'idle' | 'recording' | 'stopped';

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0); // seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // 🎙️ start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {type: 'audio/webm'});
        setAudioBlob(blob);
        setStatus('stopped');

        // cleanup mic
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setStatus('recording');

      // ⏱️ timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic permission error:', err);
    }
  };

  // ⏹ stop
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setStatus('stopped');

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 🔄 reset
  const resetRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    setStatus('idle');
  };

  return {
    status,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
