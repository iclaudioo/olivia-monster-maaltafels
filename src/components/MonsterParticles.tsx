"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const EMOJIS = ["🦇", "⭐", "🌙", "🦇", "⭐", "🌙", "🦇", "⭐"];

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
  return EMOJIS.map((emoji, i) => ({
    id: i,
    emoji,
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 10,
    size: Math.random() * 10 + 14,
    duration: Math.random() * 4 + 4,
    delay: Math.random() * 3,
  }));
}

export default function MonsterParticles() {
  const [elements] = useState(createElements);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.span
          key={el.id}
          className="absolute select-none opacity-20"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            fontSize: el.size,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 10, -10, 0],
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
