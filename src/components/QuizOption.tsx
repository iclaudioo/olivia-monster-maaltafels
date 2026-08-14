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
        card-surface min-h-16 w-full px-6 py-4 text-3xl font-bold
        text-forest-cream rounded-xl transition-colors
        disabled:cursor-not-allowed
        ${isSelected && !isRevealed ? "ring-2 ring-forest-green" : ""}
        ${isCorrectRevealed ? "!border-forest-green" : ""}
        ${isCorrectShown ? "!border-forest-green/50" : ""}
        ${isWrongRevealed ? "!border-forest-coral" : ""}
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
          ? "0 0 20px rgba(76, 175, 110, 0.6)"
          : isWrongRevealed
            ? "0 0 20px rgba(255, 107, 107, 0.5)"
            : undefined,
      }}
    >
      <span
        className={
          isCorrectRevealed || isCorrectShown
            ? "text-forest-green"
            : isWrongRevealed
              ? "text-forest-coral"
              : ""
        }
      >
        {value}
      </span>
    </motion.button>
  );
}
