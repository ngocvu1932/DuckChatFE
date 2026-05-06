import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import EmojiPicker, {EmojiClickData} from 'emoji-picker-react';

export interface EmojiPickerRef {
  toggle: () => void;
  close: () => void;
}

interface Props {
  onSelectEmoji: (emoji: string) => void;
}

const EmojiPickerController = forwardRef<EmojiPickerRef, Props>(({onSelectEmoji}, ref) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
  }));

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji);
  };

  // click bên ngoài đóng picker
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!open) return null;

  return (
    <div ref={wrapperRef} className="absolute bottom-14 right-0 z-50">
      <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
    </div>
  );
});

export default EmojiPickerController;
