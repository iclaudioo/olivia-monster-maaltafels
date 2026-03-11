"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface FlashCardProps {
  front: string;
  back: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SWIPE_THRESHOLD = 80;

export default function FlashCard({
  front,
  back,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5]
  );

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
      if (absX > absY) {
        if (offset.x > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      } else {
        if (offset.y > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
    }
  }

  function handleTap() {
    setIsFlipped((prev) => !prev);
  }

  return (
    <motion.div
      className="relative w-64 h-80 cursor-grab active:cursor-grabbing"
      style={{ perspective: 800, x, y, rotate, opacity }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ scale: 1.05 }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Front */}
        <div
          className="card-surface absolute inset-0 flex items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-4xl font-bold text-monster-text text-center">
            {front}
          </span>
        </div>

        {/* Back */}
        <div
          className="card-surface absolute inset-0 flex items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-5xl font-bold text-monster-gold text-center">
            {back}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
