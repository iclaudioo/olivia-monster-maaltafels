"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useSound } from "@/hooks/useSound";
import { useMultiplication } from "@/hooks/useMultiplication";
import QuizOption from "@/components/QuizOption";
import TableSelector from "@/components/TableSelector";
import StarRating from "@/components/StarRating";
import XPBar from "@/components/XPBar";
import ConfettiEffect from "@/components/ConfettiEffect";
import MuteButton from "@/components/MuteButton";
import MonsterParticles from "@/components/MonsterParticles";
import { calculateStars } from "@/lib/multiplication";
import {
  xpForCurrentLevel,
  XP_PER_LEVEL,
  calculateXPGain,
} from "@/lib/xp";
import type { QuizQuestion } from "@/lib/multiplication";

type Phase = "select" | "playing" | "done";

export default function QuizPage() {
  const { progress, loaded, addXP, recordTableResult, toggleSound } =
    useProgress();
  const {
    correct: playCorrect,
    wrong: playWrong,
    click: playClick,
  } = useSound(progress.soundEnabled);

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [floatingXP, setFloatingXP] = useState<{
    amount: number;
    key: number;
  } | null>(null);
  const floatingKeyRef = useRef(0);
  const [resultsRecorded, setResultsRecorded] = useState(false);

  const { session, currentQuestion, total, stars, startSession, answerQuestion } =
    useMultiplication(selectedTables, 10);

  const question = currentQuestion as QuizQuestion | null;

  const handleToggleTable = useCallback((table: number) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  }, []);

  const handleStart = useCallback(() => {
    if (selectedTables.length === 0) return;
    playClick();
    startSession("quiz");
    setSelectedOption(null);
    setIsRevealed(false);
    setResultsRecorded(false);
    setPhase("playing");
  }, [selectedTables, startSession, playClick]);

  const handleSelectOption = useCallback(
    (value: number) => {
      if (isRevealed || !question) return;

      playClick();
      setSelectedOption(value);
      setIsRevealed(true);

      const isCorrect = value === question.answer;
      if (isCorrect) {
        playCorrect();
        floatingKeyRef.current++;
        setFloatingXP({ amount: 10, key: floatingKeyRef.current });
      } else {
        playWrong();
      }

      // Wacht 1 seconde, ga dan naar volgende vraag
      setTimeout(() => {
        answerQuestion(isCorrect);
        setSelectedOption(null);
        setIsRevealed(false);
        setFloatingXP(null);
      }, 1000);
    },
    [isRevealed, question, playClick, playCorrect, playWrong, answerQuestion]
  );

  // Detecteer wanneer quiz klaar is
  useEffect(() => {
    if (session.isComplete && phase === "playing") {
      setPhase("done");
    }
  }, [session.isComplete, phase]);

  // Sla resultaten op bij done-fase (eenmalig)
  useEffect(() => {
    if (phase !== "done" || resultsRecorded) return;
    setResultsRecorded(true);

    // Groepeer resultaten per tafel
    const tableGroups = new Map<
      number,
      { correct: number; total: number }
    >();

    for (let i = 0; i < session.questions.length; i++) {
      const q = session.questions[i];
      const isCorrect = session.answers[i] ?? false;
      const existing = tableGroups.get(q.a) ?? { correct: 0, total: 0 };
      tableGroups.set(q.a, {
        correct: existing.correct + (isCorrect ? 1 : 0),
        total: existing.total + 1,
      });
    }

    for (const [table, counts] of tableGroups) {
      const tableStars = calculateStars(counts.correct, counts.total);
      recordTableResult(table, counts.correct, counts.total, tableStars);
    }

    if (session.correct > 0) {
      addXP(session.correct, session.maxStreak);
    }
  }, [phase, resultsRecorded, session, recordTableResult, addXP]);

  const handleRestart = useCallback(() => {
    playClick();
    startSession("quiz");
    setSelectedOption(null);
    setIsRevealed(false);
    setResultsRecorded(false);
    setPhase("playing");
  }, [startSession, playClick]);

  const xpGained = calculateXPGain(session.correct, session.maxStreak);
  const finalStars = calculateStars(session.correct, session.questions.length);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          👻
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-6 overflow-hidden">
      <MonsterParticles />

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-monster-light text-sm font-semibold flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
        >
          <span className="text-lg">&#8592;</span> Home
        </Link>
        <h1 className="text-xl font-bold text-monster-text font-display">
          Quiz
        </h1>
        <MuteButton muted={!progress.soundEnabled} onToggle={toggleSound} />
      </div>

      <AnimatePresence mode="wait">
        {/* SELECT PHASE */}
        {phase === "select" && (
          <motion.div
            key="select"
            className="w-full max-w-md flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="text-3xl text-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              🧠
            </motion.p>

            <p className="text-monster-light text-center text-lg">
              Kies welke tafels je wil quizzen
            </p>

            <TableSelector
              selected={selectedTables}
              onToggle={handleToggleTable}
              stars={Object.fromEntries(Object.entries(progress.tables).map(([k, v]) => [k, v.stars]))}
            />

            <motion.button
              onClick={handleStart}
              disabled={selectedTables.length === 0}
              className={`
                w-full py-4 rounded-xl text-xl font-bold text-monster-text
                min-h-[56px] transition-all
                ${
                  selectedTables.length === 0
                    ? "bg-monster-surface/40 opacity-40 cursor-not-allowed"
                    : "btn-primary glow-purple"
                }
              `}
              whileTap={selectedTables.length > 0 ? { scale: 0.95 } : undefined}
            >
              Start quiz
            </motion.button>

            <Link
              href="/"
              className="text-monster-muted text-sm hover:text-monster-light transition-colors min-h-[44px] flex items-center"
            >
              Terug naar home
            </Link>
          </motion.div>
        )}

        {/* PLAYING PHASE */}
        {phase === "playing" && question && (
          <motion.div
            key="playing"
            className="w-full max-w-md flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress bar */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-monster-darkest/60 overflow-hidden border border-monster-purple/20">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
                    boxShadow: "0 0 8px rgba(124, 58, 237, 0.6)",
                  }}
                  animate={{
                    width: `${
                      ((session.currentIndex + 1) / session.questions.length) *
                      100
                    }%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-sm font-semibold text-monster-light whitespace-nowrap">
                {session.currentIndex + 1}/{session.questions.length}
              </span>
            </div>

            {/* Streak counter */}
            <AnimatePresence>
              {session.streak >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="text-xl font-bold text-monster-gold"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    🔥
                  </motion.span>{" "}
                  x{session.streak}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vraag */}
            <motion.div
              className="card-surface w-full py-10 flex items-center justify-center relative"
              key={`q-${session.currentIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-5xl font-bold text-monster-text font-display">
                {question.a} x {question.b} = ?
              </span>

              {/* Floating XP */}
              <AnimatePresence>
                {floatingXP && (
                  <motion.span
                    key={floatingXP.key}
                    className="absolute top-2 right-4 text-lg font-bold text-monster-green"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -40 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    +{floatingXP.amount} XP
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Antwoord opties (2x2 grid) */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {question.options.map((option) => (
                <QuizOption
                  key={`${session.currentIndex}-${option}`}
                  value={option}
                  isCorrect={option === question.answer}
                  isSelected={selectedOption === option}
                  isRevealed={isRevealed}
                  onSelect={() => handleSelectOption(option)}
                  disabled={isRevealed}
                />
              ))}
            </div>

            {/* XP Bar */}
            <div className="w-full mt-2">
              <XPBar
                current={xpForCurrentLevel(progress.xp)}
                max={XP_PER_LEVEL}
                level={progress.level}
              />
            </div>
          </motion.div>
        )}

        {/* DONE PHASE */}
        {phase === "done" && (
          <motion.div
            key="done"
            className="w-full max-w-md flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {finalStars >= 3 && <ConfettiEffect />}

            <motion.h2
              className="text-4xl font-bold text-monster-gold font-display"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              Klaar!
            </motion.h2>

            <motion.div
              className="text-6xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {finalStars >= 3 ? "🏆" : finalStars >= 2 ? "🎉" : "💪"}
            </motion.div>

            {/* Score */}
            <div className="card-surface w-full p-6 flex flex-col items-center gap-4">
              <p className="text-3xl font-bold text-monster-text">
                {session.correct}/{session.questions.length} correct!
              </p>

              <StarRating stars={finalStars} size="md" />

              <div className="h-px w-full bg-monster-purple/30" />

              {/* XP samenvatting */}
              <div className="flex items-center justify-between w-full">
                <span className="text-monster-light text-lg">XP verdiend</span>
                <motion.span
                  className="text-2xl font-bold text-monster-green"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.3,
                  }}
                >
                  +{xpGained}
                </motion.span>
              </div>

              {session.maxStreak >= 3 && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-monster-light text-lg">
                    Beste reeks
                  </span>
                  <span className="text-xl font-bold text-monster-gold">
                    🔥 x{session.maxStreak}
                  </span>
                </div>
              )}

              {/* XP bar */}
              <div className="w-full mt-2">
                <XPBar
                  current={xpForCurrentLevel(progress.xp)}
                  max={XP_PER_LEVEL}
                  level={progress.level}
                />
              </div>
            </div>

            {/* Knoppen */}
            <motion.button
              onClick={handleRestart}
              className="w-full py-4 rounded-xl text-xl font-bold text-monster-text btn-primary glow-purple min-h-[56px]"
              whileTap={{ scale: 0.95 }}
            >
              Opnieuw
            </motion.button>

            <Link
              href="/"
              className="text-monster-muted text-sm hover:text-monster-light transition-colors min-h-[44px] flex items-center"
            >
              Terug naar home
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
