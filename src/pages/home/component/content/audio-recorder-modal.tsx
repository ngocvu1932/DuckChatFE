import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMicrophone, faPaperPlane, faStop, faXmark} from '@fortawesome/free-solid-svg-icons';

interface IAudioRecorderModalProps {
  status: string;
  duration: number;
  audioBlob: Blob | null;
  audioError: string;
  isUploadingAudio: boolean;
  isPendingSendAudio: boolean;
  onStopRecording: () => void;
  onCancel: () => void;
  onSend: () => void;
}

const formatRecorderDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
};

const AudioRecorderModal: React.FC<IAudioRecorderModalProps> = ({
  status,
  duration,
  audioBlob,
  audioError,
  isUploadingAudio,
  isPendingSendAudio,
  onStopRecording,
  onCancel,
  onSend,
}) => {
  const isSending = isUploadingAudio || isPendingSendAudio;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <span className="absolute h-8 w-8 animate-ping rounded-full bg-rose-200/70" />
            <FontAwesomeIcon icon={faMicrophone} className="relative" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              {status === 'recording' ? 'Đang ghi âm' : 'Sẵn sàng gửi ghi âm'}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold text-slate-700">{formatRecorderDuration(duration)}</p>
          </div>

          {status === 'recording' && (
            <button
              type="button"
              title="Dừng ghi âm"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onStopRecording}
              disabled={isUploadingAudio}
            >
              <FontAwesomeIcon icon={faStop} />
            </button>
          )}
        </div>

        {audioError && <p className="mt-3 text-sm font-semibold text-rose-500">{audioError}</p>}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={isUploadingAudio}
          >
            <FontAwesomeIcon icon={faXmark} />
            Hủy bỏ
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            onClick={onSend}
            disabled={isSending || (status !== 'recording' && !audioBlob)}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            {isSending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorderModal;
