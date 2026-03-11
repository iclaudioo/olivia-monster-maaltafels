"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useSound } from "@/hooks/useSound";
import { useMultiplication } from "@/hooks/useMultiplication";
import FlashCard from "@/components/FlashCard";
import TableSelector from "@/components/TableSelector";
import StarRating from "@/components/StarRating";
import ConfettiEffect from "@/components/ConfettiEffect";
import MuteButton from "@/components/MuteButton";
import MonsterParticles from "@/components/MonsterParticles";
import { calculateStars } from "@/lib/multiplication";

type Phase = "select" | "practice" | "done";

interface CardResult {
  a: number;
  b: number;
  answer: number;
  known: boolean;
}

export default function FlashcardsPage() {
  const { progress, loaded, addXP, recordTableResult, toggleSound } =
    useProgress();
  const { correct: playCorrect, click: playClick } = useSound(
    progress.soundEnabled
  );

  const [phase, setPhase] = useState<Phase>("select");
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [results, setResults] = useState<CardResult[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { session, startSession } = useMultiplication(selectedTables, 10);

  const currentCard = session.questions[cardIndex] ?? null;
  const totalCards = session.questions.length;

  const handleToggleTable = useCallback((table: number) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  }, []);

  const handleStart = useCallback(() => {
    if (selectedTables.length === 0) return;
    playClick();
    startSession("flashcard");
    setCardIndex(0);
    setResults([]);
    setPhase("practice");
  }, [selectedTables, startSession, playClick]);

  const advanceCard = useCallback(
    (known: boolean) => {
      if (!currentCard || isTransitioning) return;
      setIsTransitioning(true);

      const result: CardResult = {
        a: currentCard.a,
        b: currentCard.b,
        answer: currentCard.answer,
        known,
      };

      if (known) playCorrect();
      else playClick();

      const newResults = [...results, result];
      setResults(newResults);

      if (cardIndex + 1 >= totalCards) {
        // Klaar. Bereken resultaten per tafel.
        const knownCount = newResults.filter((r) => r.known).length;
        const starsEarned = calculateStars(knownCount, newResults.length);

        // Groepeer per tafel en sla resultaten op
        const tableGroups = new Map<number, { correct: number; total: number }>();
        for (const r of newResults) {
          const existing = tableGroups.get(r.a) ?? { correct: 0, total: 0 };
          tableGroups.set(r.a, {
            correct: existing.correct + (r.known ? 1 : 0),
            total: existing.total + 1,
          });
        }

        for (const [table, counts] of tableGroups) {
          const tableStars = calculateStars(counts.correct, counts.total);
          recordTableResult(table, counts.correct, counts.total, tableStars);
        }

        if (knownCount > 0) {
          addXP(knownCount, 0);
        }

        setPhase("done");
      } else {
        setCardIndex((prev) => prev + 1);
      }

      setTimeout(() => setIsTransitioning(false), 300);
    },
    [
      currentCard,
      isTransitioning,
      results,
      cardIndex,
      totalCards,
      playCorrect,
      playClick,
      recordTableResult,
      addXP,
    ]
  );

  const handleSwipeUp = useCallback(() => advanceCard(true), [advanceCard]);
  const handleSwipeDown = useCallback(() => advanceCard(false), [advanceCard]);
  const handleSwipeLeft = useCallback(() => {
    if (cardIndex > 0 && !isTransitioning) {
      playClick();
      setCardIndex((prev) => prev - 1);
      setResults((prev) => prev.slice(0, -1));
    }
  }, [cardIndex, isTransitioning, playClick]);
  const handleSwipeRight = useCallback(() => {
    if (cardIndex + 1 < totalCards && results.length > cardIndex) {
      playClick();
      setCardIndex((prev) => prev + 1);
    }
  }, [cardIndex, totalCards, results, playClick]);

  const handleBackToSelect = useCallback(() => {
    playClick();
    setPhase("select");
  }, [playClick]);

  const handleRestart = useCallback(() => {
    playClick();
    startSession("flashcard");
    setCardIndex(0);
    setResults([]);
    setPhase("practice");
  }, [startSession, playClick]);

  // Resultaatberekening voor done-fase
  const knownCount = results.filter((r) => r.known).length;
  const practiceCount = results.filter((r) => !r.known).length;
  const finalStars = calculateStars(knownCount, results.length);

  const tableStarsMap = useMemo(() => {
    if (phase !== "done") return {};
    const map: Record<number, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!map[r.a]) map[r.a] = { correct: 0, total: 0 };
      map[r.a].total++;
      if (r.known) map[r.a].correct++;
    }
    const starsMap: Record<number, number> = {};
    for (const [table, counts] of Object.entries(map)) {
      starsMap[Number(table)] = calculateStars(counts.correct, counts.total);
    }
    return starsMap;
  }, [phase, results]);

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
          href={phase === "practice" ? "#" : "/"}
          onClick={phase === "practice" ? handleBackToSelect : undefined}
          className="text-monster-light text-sm font-semibold flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
        >
          <span className="text-lg">&#8592;</span>
          {phase === "practice" ? "Terug" : "Home"}
        </Link>
        <h1 className="text-xl font-bold text-monster-text font-display">
          Flitskaarten
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
              🃏
            </motion.p>

            <p className="text-monster-light text-center text-lg">
              Kies welke tafels je wil oefenen
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
              Start
            </motion.button>

            <Link
              href="/"
              className="text-monster-muted text-sm hover:text-monster-light transition-colors min-h-[44px] flex items-center"
            >
              Terug naar home
            </Link>
          </motion.div>
        )}

        {/* PRACTICE PHASE */}
        {phase === "practice" && currentCard && (
          <motion.div
            key="practice"
            className="w-full max-w-md flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress indicator */}
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-monster-darkest/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-monster-purple"
                  animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: "0 0 8px rgba(124, 58, 237, 0.6)",
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-monster-light whitespace-nowrap">
                Kaart {cardIndex + 1}/{totalCards}
              </span>
            </div>

            {/* Instructies */}
            <div className="flex justify-between w-full text-xs text-monster-muted px-4">
              <span>&#8592; vorige</span>
              <span>tik om te draaien</span>
              <span>volgende &#8594;</span>
            </div>

            {/* FlashCard */}
            <div className="flex items-center justify-center min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${cardIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <FlashCard
                    front={`${currentCard.a} x ${currentCard.b}`}
                    back={`${currentCard.answer}`}
                    onSwipeUp={handleSwipeUp}
                    onSwipeDown={handleSwipeDown}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Swipe-hints */}
            <div className="flex flex-col items-center gap-2 text-sm">
              <motion.div
                className="flex items-center gap-2 text-monster-green font-semibold"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span>&#8593;</span> Geweten!
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-monster-pink font-semibold"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span>&#8595;</span> Nog oefenen
              </motion.div>
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
              {finalStars >= 3 ? "🏆" : finalStars >= 2 ? "😄" : "💪"}
            </motion.div>

            {/* Resultaat samenvatting */}
            <div className="card-surface w-full p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-monster-light text-lg">Geweten</span>
                <span className="text-2xl font-bold text-monster-green">
                  {knownCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-monster-light text-lg">Nog oefenen</span>
                <span className="text-2xl font-bold text-monster-pink">
                  {practiceCount}
                </span>
              </div>
              <div className="h-px bg-monster-purple/30" />

              {/* Sterren per tafel */}
              <div className="flex flex-col gap-2">
                {Object.entries(tableStarsMap).map(([table, stars]) => (
                  <div
                    key={table}
                    className="flex items-center justify-between"
                  >
                    <span className="text-monster-light font-semibold">
                      Tafel van {table}
                    </span>
                    <StarRating stars={stars} size="md" />
                  </div>
                ))}
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
