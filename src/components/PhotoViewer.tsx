"use client";

interface PhotoViewerProps {
  photoUrl: string;
  onClose: () => void;
}

export function PhotoViewer({ photoUrl, onClose }: PhotoViewerProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white hover:text-gray-300 z-10"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Photo */}
      <img
        src={photoUrl}
        alt="Completed checkpoint"
        className="max-w-full max-h-full object-contain p-4"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
