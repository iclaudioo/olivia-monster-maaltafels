"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const FOREST_ELEMENTS = ["🦇", "🌙", "✨", "🐺", "🦇", "✨", "🌕", "🐾", "🧛", "✨"];

interface FloatingElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

function createElements(): FloatingElement[] {
  return FOREST_ELEMENTS.map((emoji, i) => ({
    id: i,
    emoji,
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 10,
    size: Math.random() * 10 + 12,
    duration: Math.random() * 5 + 5,
    delay: Math.random() * 4,
  }));
}

export default function MonsterParticles() {
  const [elements] = useState(createElements);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.span
          key={el.id}
          className="absolute select-none opacity-15"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            fontSize: el.size,
          }}
          animate={{
            y: [0, -15, 5, 0],
            x: [0, 8, -6, 0],
            rotate: [0, 15, -10, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {el.emoji}
        </motion.span>
      ))}
    </div>
  );
}
