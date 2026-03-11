"use client";

import { useState, useCallback } from "react";
import {
  Question,
  QuizQuestion,
  generateQuestions,
  generateQuizQuestion,
  calculateStars,
} from "@/lib/multiplication";

interface SessionState {
  questions: (Question | QuizQuestion)[];
  currentIndex: number;
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  answers: boolean[];
  isComplete: boolean;
}

export function useMultiplication(tables: number[], questionCount: number = 10) {
  const [session, setSession] = useState<SessionState>({
    questions: [],
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    answers: [],
    isComplete: false,
  });

  const startSession = useCallback(
    (mode: "flashcard" | "quiz" | "race") => {
      if (tables.length === 0) return;

      let questions: (Question | QuizQuestion)[];
      if (mode === "quiz" || mode === "race") {
        questions = Array.from({ length: questionCount }, () => generateQuizQuestion(tables));
      } else {
        questions = generateQuestions(tables, questionCount);
      }

      setSession({
        questions,
        currentIndex: 0,
        correct: 0,
        wrong: 0,
        streak: 0,
        maxStreak: 0,
        answers: [],
        isComplete: false,
      });
    },
    [tables, questionCount]
  );

  const answerQuestion = useCallback(
    (isCorrect: boolean) => {
      setSession((prev) => {
        const newStreak = isCorrect ? prev.streak + 1 : 0;
        const newMaxStreak = Math.max(prev.maxStreak, newStreak);
        const nextIndex = prev.currentIndex + 1;

        return {
          ...prev,
          currentIndex: nextIndex,
          correct: prev.correct + (isCorrect ? 1 : 0),
          wrong: prev.wrong + (isCorrect ? 0 : 1),
          streak: newStreak,
          maxStreak: newMaxStreak,
          answers: [...prev.answers, isCorrect],
          isComplete: nextIndex >= prev.questions.length,
        };
      });
    },
    []
  );

  const addRaceQuestion = useCallback(
    (isCorrect: boolean) => {
      setSession((prev) => {
        const newStreak = isCorrect ? prev.streak + 1 : 0;
        const newMaxStreak = Math.max(prev.maxStreak, newStreak);
        const newQuestion = generateQuizQuestion(tables);

        return {
          ...prev,
          questions: [...prev.questions, newQuestion],
          currentIndex: prev.currentIndex + 1,
          correct: prev.correct + (isCorrect ? 1 : 0),
          wrong: prev.wrong + (isCorrect ? 0 : 1),
          streak: newStreak,
          maxStreak: newMaxStreak,
          answers: [...prev.answers, isCorrect],
        };
      });
    },
    [tables]
  );

  const currentQuestion = session.questions[session.currentIndex] || null;
  const total = session.correct + session.wrong;
  const stars = calculateStars(session.correct, total);

  return {
    session,
    currentQuestion,
    total,
    stars,
    startSession,
    answerQuestion,
    addRaceQuestion,
  };
}
