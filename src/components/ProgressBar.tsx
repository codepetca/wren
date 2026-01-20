"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-[500] h-3 bg-gray-200">
      <div
        className="h-full bg-green-500 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
