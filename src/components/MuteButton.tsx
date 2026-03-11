"use client";

import { motion } from "framer-motion";

interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export default function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full
        bg-monster-surface/60 backdrop-blur-sm border border-monster-purple/30
        flex items-center justify-center text-lg
        hover:bg-monster-surface transition-colors"
      aria-label={muted ? "Geluid aan" : "Geluid uit"}
    >
      {muted ? "🔇" : "🔊"}
    </motion.button>
  );
}
