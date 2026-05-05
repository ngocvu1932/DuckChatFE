import React from 'react';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<IModalProps> = ({isOpen, onClose, children, className = ''}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-white/70 ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
