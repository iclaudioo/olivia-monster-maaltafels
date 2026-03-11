"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useSound } from "@/hooks/useSound";
import { xpForCurrentLevel, XP_PER_LEVEL } from "@/lib/xp";
import { MONSTER_COLORS } from "@/hooks/useAvatar";
import AvatarDisplay from "@/components/AvatarDisplay";
import XPBar from "@/components/XPBar";
import StarRating from "@/components/StarRating";
import MuteButton from "@/components/MuteButton";
import MonsterParticles from "@/components/MonsterParticles";
import LevelUpModal from "@/components/LevelUpModal";

const MODE_CARDS = [
  {
    href: "/flashcards",
    icon: "🃏",
    title: "Flashcards",
    description: "Draai en leer",
  },
  {
    href: "/quiz",
    icon: "❓",
    title: "Quiz",
    description: "Kies het juiste antwoord",
  },
  {
    href: "/race",
    icon: "⏱️",
    title: "Race",
    description: "60 seconden uitdaging",
  },
  {
    href: "/trophies",
    icon: "🏆",
    title: "Trofeeën",
    description: "Jouw verzameling",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function getColorHex(colorId: string): string {
  return MONSTER_COLORS.find((c) => c.id === colorId)?.hex ?? "#7C3AED";
}

export default function HubPage() {
  const router = useRouter();
  const { progress, loaded, toggleSound, pendingLevelUp, dismissLevelUp } =
    useProgress();
  const { click } = useSound(progress.soundEnabled);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  useEffect(() => {
    if (loaded && !progress.avatar) {
      router.replace("/avatar-builder");
    }
  }, [loaded, progress.avatar, router]);

  if (!loaded || !progress.avatar) {
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

  const avatar = progress.avatar;
  const colorHex = getColorHex(avatar.color);
  const currentXP = xpForCurrentLevel(progress.xp);
  const tables = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="relative min-h-dvh px-4 py-6 pb-12">
      <MonsterParticles />

      {/* Mute button */}
      <div className="absolute top-4 right-4 z-20">
        <MuteButton muted={!progress.soundEnabled} onToggle={toggleSound} />
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-md flex-col gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header: avatar + level + XP */}
        <motion.div
          className="card-surface flex items-center gap-4 p-4"
          variants={item}
        >
          <AvatarDisplay
            type={avatar.type}
            color={colorHex}
            accessory={avatar.accessory}
            name={avatar.name}
            size="sm"
          />
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-lg font-bold text-monster-gold">
              Level {progress.level}
            </span>
            <XPBar
              current={currentXP}
              max={XP_PER_LEVEL}
              level={progress.level}
            />
          </div>
        </motion.div>

        {/* Mode cards: 2x2 grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={container}
        >
          {MODE_CARDS.map((card) => (
            <motion.div key={card.href} variants={item}>
              <Link
                href={card.href}
                onClick={() => click()}
                className="card-surface flex min-h-[120px] flex-col items-center justify-center gap-2 p-4 text-center transition-transform active:scale-95"
              >
                <span className="text-4xl">{card.icon}</span>
                <span className="text-lg font-bold text-monster-text">
                  {card.title}
                </span>
                <span className="text-sm text-monster-muted">
                  {card.description}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Maaltafel overview: 5x2 grid */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-center text-xl font-bold text-monster-light">
            Maaltafels
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {tables.map((t) => {
              const tableData = progress.tables[t];
              const stars = tableData?.stars ?? 0;

              return (
                <motion.button
                  key={t}
                  className="card-surface flex flex-col items-center gap-1 py-3 min-h-[60px] cursor-pointer"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    click();
                    setSelectedTable(t);
                  }}
                >
                  <span className="text-lg font-bold text-monster-text">
                    x{t}
                  </span>
                  <StarRating stars={stars} size="sm" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Maaltafel detail modal */}
      <AnimatePresence>
        {selectedTable !== null && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTable(null)}
          >
            <motion.div
              className="card-surface w-full max-w-xs p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-center text-2xl font-bold text-monster-gold">
                Tafel van {selectedTable}
              </h3>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-between rounded-lg bg-monster-darkest/40 px-4 py-2"
                  >
                    <span className="text-lg font-semibold text-monster-light">
                      {selectedTable} x {n}
                    </span>
                    <span className="text-lg font-bold text-monster-gold">
                      = {selectedTable * n}
                    </span>
                  </div>
                ))}
              </div>
              <motion.button
                className="btn-primary glow-purple mt-5 w-full text-lg font-bold text-white"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTable(null)}
              >
                Sluiten
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level-up modal */}
      {pendingLevelUp && (
        <LevelUpModal
          level={pendingLevelUp.level}
          reward={pendingLevelUp}
          onDismiss={dismissLevelUp}
        />
      )}
    </div>
  );
}
