import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        onClick={handleModalClick}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <h2 id="modal-title" className="text-xl font-bold mb-6 text-center pr-8">{title}</h2>}
        <div className="pb-2">
          {children}
        </div>
      </div>
    </div>
  );
} 