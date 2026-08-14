"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { getUnlockedRewards, getLockedRewards } from "@/lib/xp";
import { MONSTER_COLORS } from "@/hooks/useAvatar";
import AvatarDisplay from "@/components/AvatarDisplay";
import StarRating from "@/components/StarRating";
import MonsterParticles from "@/components/MonsterParticles";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function getColorHex(colorId: string): string {
  return MONSTER_COLORS.find((c) => c.id === colorId)?.hex ?? "#9C27B0";
}

export default function TrophiesPage() {
  const { progress, loaded } = useProgress();

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

  const unlockedRewards = getUnlockedRewards(progress.level);
  const lockedRewards = getLockedRewards(progress.level);

  const tables = Array.from({ length: 10 }, (_, i) => i + 1);
  const favoriteTable = tables.reduce((best, t) => {
    const current = progress.tables[t]?.totalAttempts ?? 0;
    const bestVal = progress.tables[best]?.totalAttempts ?? 0;
    return current > bestVal ? t : best;
  }, 1);
  const hasPracticed = (progress.tables[favoriteTable]?.totalAttempts ?? 0) > 0;

  return (
    <div className="relative min-h-dvh px-4 py-6 pb-12">
      <MonsterParticles />
      <motion.div
        className="mx-auto flex w-full max-w-md flex-col gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div className="flex items-center justify-between" variants={item}>
          <Link
            href="/"
            className="text-forest-light text-xl font-semibold"
          >
            &larr; Terug
          </Link>
          <h1 className="text-3xl font-bold text-forest-gold font-display">
            {"🏆"} Trofeeën
          </h1>
          <div className="w-16" />
        </motion.div>

        {/* Section 1: Player stats */}
        <motion.div className="card-surface p-6" variants={item}>
          <div className="flex flex-col items-center gap-4">
            {progress.avatar ? (
              <AvatarDisplay
                type={progress.avatar.type}
                color={getColorHex(progress.avatar.color)}
                name={progress.avatar.name}
                size="lg"
              />
            ) : (
              <div className="text-6xl">{"🧛"}</div>
            )}

            <div className="text-center">
              <div className="text-2xl font-bold text-forest-gold font-display">
                Level {progress.level}
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <StatCard
                label="Juiste antwoorden"
                value={progress.totalCorrect.toString()}
                emoji="✅"
                delay={0.1}
              />
              <StatCard
                label="Langste streak"
                value={progress.longestStreak.toString()}
                emoji="🔥"
                delay={0.15}
              />
              <StatCard
                label="Beste race"
                value={progress.bestRaceScore.toString()}
                emoji="🐺"
                delay={0.2}
              />
              <StatCard
                label="Favoriete tafel"
                value={hasPracticed ? `x${favoriteTable}` : "-"}
                emoji="⭐"
                delay={0.25}
              />
            </div>
          </div>
        </motion.div>

        {/* Section 2: Unlocked rewards */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-2xl font-bold text-forest-light font-display">
            {"🎁"} Ontgrendeld
          </h2>

          {unlockedRewards.length === 0 ? (
            <div className="card-surface p-6 text-center text-forest-muted">
              Nog geen beloningen ontgrendeld. Blijf oefenen!
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-3 gap-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {unlockedRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className="card-surface flex flex-col items-center gap-2 p-4 glow-green"
                  variants={item}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-4xl">{reward.emoji}</span>
                  <span className="text-base font-semibold text-forest-cream text-center leading-tight">
                    {reward.name}
                  </span>
                  <span className="text-sm text-forest-gold font-bold">
                    Level {reward.level}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Section 3: Locked rewards */}
        {lockedRewards.length > 0 && (
          <motion.div variants={item}>
            <h2 className="mb-3 text-2xl font-bold text-forest-light font-display">
              {"🔒"} Nog te ontgrendelen
            </h2>

            <motion.div
              className="grid grid-cols-3 gap-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {lockedRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className="card-surface flex flex-col items-center gap-2 p-4 opacity-50"
                  variants={item}
                >
                  <span className="text-4xl grayscale">{"🔒"}</span>
                  <span className="text-base font-semibold text-forest-muted text-center leading-tight">
                    ???
                  </span>
                  <span className="text-sm text-forest-muted font-bold">
                    Level {reward.level}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Section 4: Table mastery */}
        <motion.div variants={item}>
          <h2 className="mb-3 text-2xl font-bold text-forest-light font-display">
            {"🌙"} Maaltafel meesterschap
          </h2>

          <motion.div
            className="flex flex-col gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {tables.map((t) => {
              const tableData = progress.tables[t];
              const attempts = tableData?.totalAttempts ?? 0;
              const correctCount = tableData?.totalCorrect ?? 0;
              const stars = tableData?.stars ?? 0;
              const percentage = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;

              return (
                <motion.div
                  key={t}
                  className="card-surface flex items-center gap-4 p-4"
                  variants={item}
                >
                  {/* Table number */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-green/30 text-2xl font-bold text-forest-cream font-display">
                    x{t}
                  </div>

                  {/* Progress info */}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <StarRating stars={stars} size="sm" />
                      <span className="text-base text-forest-muted">
                        {attempts > 0 ? `${percentage}% juist` : "Nog niet geoefend"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-forest-green/20">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            percentage >= 80
                              ? "linear-gradient(90deg, #4CAF6E, #FFD166)"
                              : percentage >= 50
                                ? "linear-gradient(90deg, #FFD166, #FF8FAB)"
                                : "linear-gradient(90deg, #FF6B6B, #FF8FAB)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * t }}
                      />
                    </div>

                    <div className="flex justify-between text-sm text-forest-muted">
                      <span>{correctCount} juist</span>
                      <span>{attempts} pogingen</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  delay,
}: {
  label: string;
  value: string;
  emoji: string;
  delay: number;
}) {
  return (
    <motion.div
      className="card-surface flex flex-col items-center gap-1 p-3 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-2xl font-bold text-forest-cream font-display">{value}</span>
      <span className="text-sm text-forest-muted leading-tight">{label}</span>
    </motion.div>
  );
}
