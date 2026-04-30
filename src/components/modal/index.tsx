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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/40 px-4" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
