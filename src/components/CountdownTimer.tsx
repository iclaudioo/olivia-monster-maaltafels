"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  isRunning: boolean;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({
  seconds,
  onComplete,
  isRunning,
}: CountdownTimerProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (seconds <= 0 && isRunning && !hasFiredRef.current) {
      hasFiredRef.current = true;
      onCompleteRef.current?.();
    }
    if (seconds > 0) {
      hasFiredRef.current = false;
    }
  }, [seconds, isRunning]);

  const isLow = seconds <= 10 && seconds > 0;
  const strokeColor = isLow ? "#EF4444" : "#7C3AED";
  const textColor = isLow ? "text-monster-red" : "text-monster-text";

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke="rgba(124, 58, 237, 0.2)"
          strokeWidth="6"
        />

        {/* Animated progress circle */}
        <motion.circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{
            strokeDashoffset: isRunning
              ? CIRCUMFERENCE
              : 0,
          }}
          transition={{
            duration: isRunning ? seconds : 0,
            ease: "linear",
          }}
          style={{
            filter: isLow
              ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))"
              : "drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))",
          }}
        />
      </svg>

      <span
        className={`absolute text-2xl font-bold ${textColor}`}
      >
        {Math.max(0, seconds)}
      </span>
    </div>
  );
}
