"use client";

import { motion, AnimatePresence } from "framer-motion";
import ConfettiEffect from "./ConfettiEffect";

interface LevelUpModalProps {
  level: number;
  reward: { name: string; emoji: string } | null;
  onDismiss: () => void;
}

export default function LevelUpModal({
  level,
  reward,
  onDismiss,
}: LevelUpModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        />

        {/* Confetti behind the modal */}
        <ConfettiEffect />

        {/* Modal card */}
        <motion.div
          className="card-surface relative z-50 p-8 mx-4 max-w-sm w-full text-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
          }}
        >
          <h2
            className="text-4xl font-bold mb-2"
            style={{
              color: "#FFD700",
              textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
            }}
          >
            LEVEL UP!
          </h2>

          <p className="text-6xl font-bold text-monster-text mb-4">
            {level}
          </p>

          {reward && (
            <div className="mb-6">
              <span className="text-5xl block mb-2">{reward.emoji}</span>
              <p className="text-lg text-monster-light font-semibold">
                {reward.name} vrijgespeeld!
              </p>
            </div>
          )}

          <motion.button
            onClick={onDismiss}
            className="btn-primary text-monster-text text-lg w-full"
            whileTap={{ scale: 0.95 }}
          >
            Geweldig!
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
