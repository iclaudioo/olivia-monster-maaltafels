"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#FFD700", "#F472B6", "#7C3AED", "#34D399"];
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.8,
    rotation: Math.random() * 360,
  }));
}

export default function ConfettiEffect() {
  const [visible, setVisible] = useState(true);
  const [particles] = useState(createParticles);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: -10,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                rotate: p.rotation + 720,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5,
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
