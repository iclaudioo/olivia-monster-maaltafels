"use client";

import { motion } from "framer-motion";

interface QuizOptionProps {
  value: number;
  isCorrect: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function QuizOption({
  value,
  isCorrect,
  isSelected,
  isRevealed,
  onSelect,
  disabled = false,
}: QuizOptionProps) {
  const isCorrectRevealed = isRevealed && isSelected && isCorrect;
  const isWrongRevealed = isRevealed && isSelected && !isCorrect;
  const isCorrectShown = isRevealed && isCorrect && !isSelected;

  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled || isRevealed}
      className={`
        card-surface min-h-16 w-full px-6 py-4 text-2xl font-bold
        text-monster-text rounded-xl transition-colors
        disabled:cursor-not-allowed
        ${isSelected && !isRevealed ? "ring-2 ring-monster-purple" : ""}
        ${isCorrectRevealed ? "!border-monster-green" : ""}
        ${isCorrectShown ? "!border-monster-green/50" : ""}
        ${isWrongRevealed ? "!border-monster-red" : ""}
      `}
      animate={
        isCorrectRevealed
          ? { scale: [1, 1.08, 1] }
          : isWrongRevealed
            ? { x: [0, -8, 8, -4, 4, 0] }
            : {}
      }
      transition={{ duration: 0.4 }}
      whileTap={!disabled && !isRevealed ? { scale: 0.95 } : undefined}
      style={{
        boxShadow: isCorrectRevealed
          ? "0 0 20px rgba(52, 211, 153, 0.6)"
          : isWrongRevealed
            ? "0 0 20px rgba(239, 68, 68, 0.5)"
            : undefined,
      }}
    >
      <span
        className={
          isCorrectRevealed || isCorrectShown
            ? "text-monster-green"
            : isWrongRevealed
              ? "text-monster-red"
              : ""
        }
      >
        {value}
      </span>
    </motion.button>
  );
}
