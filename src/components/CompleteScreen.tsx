"use client";

interface CompleteScreenProps {
  photoUrls: string[];
  onPlayAgain: () => void;
}

export function CompleteScreen({ photoUrls, onPlayAgain }: CompleteScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-500 to-green-600 z-[1000] flex flex-col items-center justify-center p-6 overflow-auto">
      {/* Celebration */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-2">You Found All {photoUrls.length}!</h1>
        <p className="text-green-100 text-lg">Great job exploring!</p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 max-w-sm mb-8">
        {photoUrls.map((url, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg overflow-hidden border-2 border-white/30"
          >
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Play again button */}
      <button
        onClick={onPlayAgain}
        className="px-8 py-4 bg-white text-green-600 text-xl font-semibold rounded-2xl shadow-lg hover:bg-green-50 transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
