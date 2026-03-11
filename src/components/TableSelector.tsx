"use client";

import { motion } from "framer-motion";
import StarRating from "./StarRating";

interface TableSelectorProps {
  selected: number[];
  onToggle: (table: number) => void;
  stars: Record<number, number>;
}

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function TableSelector({
  selected,
  onToggle,
  stars,
}: TableSelectorProps) {
  const allSelected = TABLES.every((t) => selected.includes(t));

  function handleToggleAll() {
    if (allSelected) {
      TABLES.forEach((t) => {
        if (selected.includes(t)) onToggle(t);
      });
    } else {
      TABLES.forEach((t) => {
        if (!selected.includes(t)) onToggle(t);
      });
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2">
        {TABLES.map((table) => {
          const isSelected = selected.includes(table);
          return (
            <motion.button
              key={table}
              onClick={() => onToggle(table)}
              whileTap={{ scale: 0.92 }}
              className={`
                card-surface flex flex-col items-center justify-center
                py-3 px-2 rounded-xl transition-all
                ${
                  isSelected
                    ? "ring-2 ring-monster-purple glow-purple"
                    : "opacity-60"
                }
              `}
            >
              <span className="text-xl font-bold text-monster-text">
                {table}
              </span>
              <StarRating stars={stars[table] ?? 0} size="sm" />
            </motion.button>
          );
        })}
      </div>

      <motion.button
        onClick={handleToggleAll}
        whileTap={{ scale: 0.95 }}
        className={`
          mt-3 w-full py-3 rounded-xl font-semibold text-monster-text
          transition-all
          ${allSelected ? "bg-monster-purple/40 border border-monster-purple" : "btn-primary"}
        `}
      >
        {allSelected ? "Alles deselecteren" : "Alle tafels"}
      </motion.button>
    </div>
  );
}
