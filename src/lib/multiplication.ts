export interface Question {
  a: number;
  b: number;
  answer: number;
}

export interface QuizQuestion extends Question {
  options: number[];
}

export function generateQuestions(tables: number[], count: number = 10): Question[] {
  const allQuestions: Question[] = [];

  for (const table of tables) {
    for (let i = 1; i <= 10; i++) {
      allQuestions.push({ a: table, b: i, answer: table * i });
    }
  }

  return shuffle(allQuestions).slice(0, count);
}

export function generateQuizQuestion(tables: number[]): QuizQuestion {
  const table = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * 10) + 1;
  const answer = table * b;

  const options = generateOptions(answer, table);

  return { a: table, b, answer, options };
}

function generateOptions(correct: number, table: number): number[] {
  const options = new Set<number>([correct]);

  // Plausible wrong answers: nearby multiples and off-by-one errors
  const candidates = [
    correct + table,
    correct - table,
    correct + 1,
    correct - 1,
    correct + 10,
    correct - 10,
    table * (Math.floor(correct / table) + 2),
    correct * 2,
    Math.abs(correct - table * 2),
  ].filter((n) => n > 0 && n !== correct);

  while (options.size < 4) {
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const candidate = candidates.splice(idx, 1)[0];
      options.add(candidate);
    } else {
      options.add(Math.floor(Math.random() * 100) + 1);
    }
  }

  return shuffle(Array.from(options));
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateStars(correct: number, total: number): number {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 0.95) return 3;
  if (pct >= 0.8) return 2;
  if (pct >= 0.6) return 1;
  return 0;
}
