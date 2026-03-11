"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useSound } from "@/hooks/useSound";
import { useMultiplication } from "@/hooks/useMultiplication";
import { calculateXPGain } from "@/lib/xp";
import type { QuizQuestion } from "@/lib/multiplication";
import TableSelector from "@/components/TableSelector";
import CountdownTimer from "@/components/CountdownTimer";
import QuizOption from "@/components/QuizOption";
import ConfettiEffect from "@/components/ConfettiEffect";
import MuteButton from "@/components/MuteButton";
import MonsterParticles from "@/components/MonsterParticles";

type Phase = "select" | "countdown" | "racing" | "done";

const RACE_DURATION = 60;

const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];

export default function RacePage() {
  const { progress, loaded, addXP, updateRaceScore, updateStreak, toggleSound } =
    useProgress();
  const { correct: playCorrect, wrong: playWrong, click, tick } =
    useSound(progress.soundEnabled);

  const [selectedTables, setSelectedTables] = useState<number[]>([2]);
  const [phase, setPhase] = useState<Phase>("select");

  // Countdown state
  const [countdownIndex, setCountdownIndex] = useState(0);

  // Race state
  const [timeLeft, setTimeLeft] = useState(RACE_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results state
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const { currentQuestion, session, startSession, addRaceQuestion } =
    useMultiplication(selectedTables, 1);

  const starsMap: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) {
    starsMap[i] = progress.tables[i]?.stars ?? 0;
  }

  // Toggle table selection
  function handleToggleTable(table: number) {
    click();
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  }

  // Start the countdown
  function handleStartRace() {
    if (selectedTables.length === 0) return;
    click();
    setCountdownIndex(0);
    setPhase("countdown");
  }

  // Countdown logic
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdownIndex >= COUNTDOWN_STEPS.length) {
      // Start racing
      startSession("race");
      setScore(0);
      setStreak(0);
      setTotalAnswered(0);
      setTimeLeft(RACE_DURATION);
      setPhase("racing");
      return;
    }

    const timeout = setTimeout(() => {
      setCountdownIndex((i) => i + 1);
    }, countdownIndex < COUNTDOWN_STEPS.length - 1 ? 800 : 600);

    return () => clearTimeout(timeout);
  }, [phase, countdownIndex, startSession]);

  // Race timer
  useEffect(() => {
    if (phase !== "racing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Tick sound in last 10 seconds
  useEffect(() => {
    if (phase === "racing" && timeLeft <= 10 && timeLeft > 0) {
      tick();
    }
  }, [phase, timeLeft, tick]);

  // Handle timer complete
  const handleTimerComplete = useCallback(() => {
    if (phase !== "racing") return;
    setPhase("done");
  }, [phase]);

  // When time hits 0, transition to done
  useEffect(() => {
    if (phase === "racing" && timeLeft <= 0) {
      handleTimerComplete();
    }
  }, [phase, timeLeft, handleTimerComplete]);

  // Calculate results when done
  useEffect(() => {
    if (phase !== "done") return;

    const newRecord = updateRaceScore(score);
    setIsNewRecord(newRecord);

    const xp = addXP(score, session.maxStreak);
    setXpGained(xp);
    updateStreak(session.maxStreak);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle answer selection in race mode
  function handleAnswer(value: number) {
    if (!currentQuestion || phase !== "racing") return;

    const isCorrect = value === currentQuestion.answer;

    if (isCorrect) {
      playCorrect();
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setFlashColor("green");
    } else {
      playWrong();
      setStreak(0);
      setFlashColor("red");
    }

    setTotalAnswered((t) => t + 1);
    addRaceQuestion(isCorrect);

    // Clear flash after brief moment
    setTimeout(() => setFlashColor(null), 200);
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
      <MuteButton muted={!progress.soundEnabled} onToggle={toggleSound} />

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {/* SELECT PHASE */}
        {phase === "select" && (
          <motion.div
            className="flex w-full flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-monster-light text-lg font-semibold"
              >
                &larr; Terug
              </Link>
              <h1 className="text-2xl font-bold text-monster-gold">
                Race modus
              </h1>
              <div className="w-16" />
            </div>

            <div className="card-surface p-4 text-center">
              <p className="text-monster-text text-lg">
                Beantwoord zoveel mogelijk vragen in 60 seconden!
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-center text-xl font-bold text-monster-light">
                Kies je tafels
              </h2>
              <TableSelector
                selected={selectedTables}
                onToggle={handleToggleTable}
                stars={starsMap}
              />
            </div>

            <motion.button
              onClick={handleStartRace}
              disabled={selectedTables.length === 0}
              whileTap={{ scale: 0.95 }}
              className={`btn-primary w-full py-4 text-xl font-bold text-monster-text ${
                selectedTables.length === 0 ? "opacity-40 cursor-not-allowed" : "glow-purple"
              }`}
            >
              Start race!
            </motion.button>
          </motion.div>
        )}

        {/* COUNTDOWN PHASE */}
        {phase === "countdown" && (
          <div className="flex min-h-[60dvh] w-full items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdownIndex}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`text-8xl font-bold ${
                  countdownIndex === COUNTDOWN_STEPS.length - 1
                    ? "text-monster-green"
                    : "text-monster-gold"
                }`}
                style={{
                  filter:
                    countdownIndex === COUNTDOWN_STEPS.length - 1
                      ? "drop-shadow(0 0 30px rgba(52, 211, 153, 0.8))"
                      : "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
                }}
              >
                {COUNTDOWN_STEPS[countdownIndex] ?? ""}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* RACING PHASE */}
        {phase === "racing" && (
          <motion.div
            className="flex w-full flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Timer + score row */}
            <div className="flex w-full items-center justify-between">
              <CountdownTimer
                seconds={timeLeft}
                onComplete={handleTimerComplete}
                isRunning={timeLeft > 0}
              />

              <div className="flex flex-col items-end gap-1">
                <div className="text-4xl font-bold text-monster-gold">
                  {score}
                </div>
                <span className="text-monster-muted text-sm">score</span>
              </div>
            </div>

            {/* Streak display */}
            <AnimatePresence>
              {streak >= 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-2xl font-bold text-orange-400"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(251, 146, 60, 0.6))",
                  }}
                >
                  {"🔥"} x{streak}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question */}
            {currentQuestion && (
              <motion.div
                className={`card-surface w-full p-6 text-center transition-colors duration-200 ${
                  flashColor === "green"
                    ? "!border-monster-green"
                    : flashColor === "red"
                      ? "!border-monster-red"
                      : ""
                }`}
                style={{
                  boxShadow:
                    flashColor === "green"
                      ? "0 0 25px rgba(52, 211, 153, 0.5)"
                      : flashColor === "red"
                        ? "0 0 25px rgba(239, 68, 68, 0.5)"
                        : undefined,
                }}
              >
                <div className="text-5xl font-bold text-monster-text">
                  {currentQuestion.a} x {currentQuestion.b} = ?
                </div>
              </motion.div>
            )}

            {/* Answer options: 2x2 grid */}
            {currentQuestion && (
              <div className="grid w-full grid-cols-2 gap-3">
                {(currentQuestion as QuizQuestion).options.map((option) => (
                  <motion.button
                    key={`${currentQuestion.a}-${currentQuestion.b}-${option}`}
                    onClick={() => handleAnswer(option)}
                    whileTap={{ scale: 0.92 }}
                    className="card-surface min-h-16 w-full px-6 py-4 text-3xl font-bold text-monster-text rounded-xl active:scale-95"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* DONE PHASE */}
        {phase === "done" && (
          <motion.div
            className="flex w-full flex-col items-center gap-6 pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isNewRecord && <ConfettiEffect />}

            <motion.h1
              className="text-4xl font-bold text-monster-gold"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              Tijd voorbij!
            </motion.h1>

            {isNewRecord && (
              <motion.div
                className="text-2xl font-bold text-monster-green"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  filter: "drop-shadow(0 0 15px rgba(52, 211, 153, 0.7))",
                }}
              >
                NIEUW RECORD! {"🎉"}
              </motion.div>
            )}

            {/* Score card */}
            <motion.div
              className="card-surface w-full p-6 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl font-bold text-monster-gold mb-2">
                {score}
              </div>
              <div className="text-monster-muted text-lg">
                punten
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid w-full grid-cols-3 gap-3">
              <motion.div
                className="card-surface p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl font-bold text-monster-text">
                  {totalAnswered}
                </div>
                <div className="text-sm text-monster-muted">vragen</div>
              </motion.div>

              <motion.div
                className="card-surface p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-2xl font-bold text-monster-text">
                  {"🔥"} {session.maxStreak}
                </div>
                <div className="text-sm text-monster-muted">streak</div>
              </motion.div>

              <motion.div
                className="card-surface p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-2xl font-bold text-monster-green">
                  +{xpGained}
                </div>
                <div className="text-sm text-monster-muted">XP</div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex w-full gap-3">
              <motion.button
                onClick={() => {
                  click();
                  setPhase("select");
                }}
                whileTap={{ scale: 0.95 }}
                className="card-surface flex-1 py-4 text-lg font-bold text-monster-text"
              >
                Opnieuw
              </motion.button>

              <Link
                href="/"
                onClick={() => click()}
                className="card-surface flex flex-1 items-center justify-center py-4 text-lg font-bold text-monster-text"
              >
                Terug
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
