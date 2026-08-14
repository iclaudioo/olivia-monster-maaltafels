"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import {
  useAvatar,
  MONSTER_TYPES,
  MONSTER_COLORS,
} from "@/hooks/useAvatar";
import AvatarDisplay from "@/components/AvatarDisplay";
import MonsterParticles from "@/components/MonsterParticles";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function AvatarBuilderPage() {
  const router = useRouter();
  const { progress, loaded, setAvatar } = useProgress();
  const {
    type,
    setType,
    color,
    setColor,
    name,
    setName,
    config,
    isValid,
  } = useAvatar(progress.avatar);

  const colorHex =
    MONSTER_COLORS.find((c) => c.id === color)?.hex ?? "#9C27B0";

  function handleStart() {
    if (!isValid) return;
    setAvatar(config);
    router.push("/");
  }

  if (!loaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <motion.div
          className="text-5xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🧛
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh px-4 py-6 pb-12">
      <MonsterParticles />

      <motion.div
        className="mx-auto flex w-full max-w-md flex-col items-center gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Title */}
        <motion.h1
          className="text-4xl font-bold text-forest-gold font-display"
          variants={item}
        >
          Kies je vampier of weerwolf!
        </motion.h1>

        {/* Live preview */}
        <motion.div
          className="card-surface flex flex-col items-center gap-2 p-6"
          variants={item}
        >
          <AvatarDisplay
            type={type}
            color={colorHex}
            name={name || "..."}
            size="lg"
          />
        </motion.div>

        {/* Name input */}
        <motion.div className="w-full" variants={item}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Geef je monster een naam!"
            maxLength={20}
            className="w-full rounded-xl border-2 border-forest-green bg-forest-deepest px-4 py-3 text-center text-xl font-semibold text-forest-cream placeholder:text-forest-muted focus:border-forest-gold focus:outline-none"
          />
        </motion.div>

        {/* Animal type selection */}
        <motion.div className="w-full" variants={item}>
          <h2 className="mb-2 text-center text-xl font-bold text-forest-light font-display">
            Kies je karakter
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {MONSTER_TYPES.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => {
                  setType(m.id);
                }}
                className={`card-surface flex min-h-[80px] flex-col items-center justify-center gap-1 p-3 transition-transform active:scale-95 ${
                  type === m.id ? "glow-purple border-forest-green border-2" : ""
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-sm font-semibold text-forest-cream">
                  {m.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Color selection */}
        <motion.div className="w-full" variants={item}>
          <h2 className="mb-2 text-center text-xl font-bold text-forest-light font-display">
            Kleur
          </h2>
          <div className="flex justify-center gap-4">
            {MONSTER_COLORS.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => {
                  setColor(c.id);
                }}
                className={`h-14 w-14 rounded-full transition-transform active:scale-95 ${
                  color === c.id ? "ring-4 ring-forest-gold ring-offset-2 ring-offset-forest-deepest" : ""
                }`}
                style={{ backgroundColor: c.hex }}
                whileTap={{ scale: 0.9 }}
                aria-label={c.name}
              />
            ))}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={!isValid}
          className={`btn-primary w-full text-xl font-bold ${
            isValid
              ? "glow-purple"
              : "cursor-not-allowed opacity-40"
          }`}
          variants={item}
          whileHover={isValid ? { scale: 1.03 } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
        >
          Start!
        </motion.button>
      </motion.div>
    </div>
  );
}
