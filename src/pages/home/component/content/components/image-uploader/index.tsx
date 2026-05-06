import {faPaperPlane, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useEffect, useRef, useState} from 'react';

interface IImageUploaderProps {
  onChange?: (files: File[]) => void;
  max?: number;
  onCancel?: () => void;
  onSend?: () => void;
  isSending?: boolean;
}

const ImageUploader = ({onChange, max = 5, onCancel, onSend, isSending = false}: IImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (hasOpenedRef.current) return;

    hasOpenedRef.current = true;
    inputRef.current?.click();
  }, []);

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    let selected = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (selected.length + files.length > max) {
      selected = selected.slice(0, max - files.length);
    }

    const newFiles = [...files, ...selected];
    setFiles(newFiles);
    const newPreviews = [...previews, ...selected.map((f) => URL.createObjectURL(f))];
    setPreviews(newPreviews);
    onChange?.(newFiles);
  };

  const remove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange?.(newFiles);

    if (newPreviews.length == 0) {
      onCancel?.();
    }
  };

  return (
    <>
      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleSelectFiles(e.target.files)}
      />

      {previews.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="max-h-52 overflow-y-auto">
              <div
                className={`grid gap-2 ${
                  previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {previews.map((url, i) => (
                  <div key={i} className={`relative group ${previews.length === 1 ? 'mx-auto w-40' : 'w-full'}`}>
                    {/* container vuông */}
                    <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {/* ảnh giữ nguyên tỉ lệ */}
                      <img src={url} className="max-w-full max-h-full object-contain" />

                      {/* nút xoá */}
                      <button
                        onClick={() => remove(i)}
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onCancel}
                disabled={isSending}
              >
                <FontAwesomeIcon icon={faXmark} />
                Hủy bỏ
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                onClick={onSend}
                disabled={isSending}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {isSending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
