"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  onTick?: (seconds: number) => void;
  className?: string;
}

const Timer = ({ initialSeconds, onTimeUp, onTick, className }: TimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (seconds === 0 && onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev - 1;
        if (onTick) {
          onTick(newSeconds);
        }
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onTimeUp, onTick]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getColorClass = () => {
    if (seconds <= 10) return "text-destructive-100";
    if (seconds <= 30) return "text-yellow-500";
    return "text-primary-200";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={`font-bold text-lg ${getColorClass()}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;


