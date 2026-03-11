"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

export default function XPBar({ current, max, level }: XPBarProps) {
  const percent = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-monster-light">
          Level {level}
        </span>
        <span className="text-xs text-monster-muted">
          {current} / {max} XP
        </span>
      </div>

      <div className="h-4 rounded-full bg-monster-darkest/60 overflow-hidden border border-monster-purple/30">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #7C3AED 0%, #A78BFA 60%, #7C3AED 100%)",
            boxShadow: "0 0 12px rgba(124, 58, 237, 0.6)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
