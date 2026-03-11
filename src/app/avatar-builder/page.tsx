"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import {
  useAvatar,
  MONSTER_TYPES,
  MONSTER_COLORS,
  MONSTER_ACCESSORIES,
} from "@/hooks/useAvatar";
import { useSound } from "@/hooks/useSound";
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
    accessory,
    setAccessory,
    name,
    setName,
    config,
    isValid,
  } = useAvatar(progress.avatar);
  const { click } = useSound(progress.soundEnabled);

  const colorHex =
    MONSTER_COLORS.find((c) => c.id === color)?.hex ?? "#7C3AED";
  const accessoryEmoji =
    MONSTER_ACCESSORIES.find((a) => a.id === accessory)?.emoji ?? "";

  function handleStart() {
    if (!isValid) return;
    click();
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
          👻
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
          className="text-3xl font-bold text-monster-gold"
          variants={item}
        >
          Kies je monster!
        </motion.h1>

        {/* Live preview */}
        <motion.div
          className="card-surface flex flex-col items-center gap-2 p-6"
          variants={item}
        >
          <AvatarDisplay
            type={type}
            color={colorHex}
            accessory={accessoryEmoji}
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
            placeholder="Hoe heet jouw monster?"
            maxLength={20}
            className="w-full rounded-xl border-2 border-monster-purple bg-monster-darkest px-4 py-3 text-center text-lg font-semibold text-monster-text placeholder:text-monster-muted focus:border-monster-gold focus:outline-none"
          />
        </motion.div>

        {/* Monster type selection */}
        <motion.div className="w-full" variants={item}>
          <h2 className="mb-2 text-center text-lg font-bold text-monster-light">
            Type monster
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {MONSTER_TYPES.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => {
                  click();
                  setType(m.id);
                }}
                className={`card-surface flex min-h-[80px] flex-col items-center justify-center gap-1 p-3 transition-transform active:scale-95 ${
                  type === m.id ? "glow-purple border-monster-purple border-2" : ""
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-semibold text-monster-text">
                  {m.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Color selection */}
        <motion.div className="w-full" variants={item}>
          <h2 className="mb-2 text-center text-lg font-bold text-monster-light">
            Kleur
          </h2>
          <div className="flex justify-center gap-4">
            {MONSTER_COLORS.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => {
                  click();
                  setColor(c.id);
                }}
                className={`h-14 w-14 rounded-full transition-transform active:scale-95 ${
                  color === c.id ? "ring-4 ring-monster-gold ring-offset-2 ring-offset-monster-darkest" : ""
                }`}
                style={{ backgroundColor: c.hex }}
                whileTap={{ scale: 0.9 }}
                aria-label={c.name}
              />
            ))}
          </div>
        </motion.div>

        {/* Accessory selection */}
        <motion.div className="w-full" variants={item}>
          <h2 className="mb-2 text-center text-lg font-bold text-monster-light">
            Accessoire
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {MONSTER_ACCESSORIES.map((a) => (
              <motion.button
                key={a.id}
                onClick={() => {
                  click();
                  setAccessory(a.id);
                }}
                className={`card-surface flex min-h-[64px] flex-col items-center justify-center gap-1 p-3 transition-transform active:scale-95 ${
                  accessory === a.id ? "glow-purple border-monster-purple border-2" : ""
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <span className="text-2xl">{a.emoji || "✖️"}</span>
                <span className="text-xs font-semibold text-monster-text">
                  {a.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={!isValid}
          className={`btn-primary w-full text-xl font-bold text-white ${
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
