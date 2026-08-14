"use client";

interface StarRatingProps {
  stars: number;
  size?: "sm" | "md";
}

const SIZE_MAP = {
  sm: "text-sm gap-0.5",
  md: "text-xl gap-1",
};

export default function StarRating({ stars, size = "md" }: StarRatingProps) {
  const maxStars = 3;
  const clamped = Math.max(0, Math.min(maxStars, stars));

  return (
    <span className={`inline-flex items-center ${SIZE_MAP[size]}`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={
            i < clamped
              ? "text-forest-gold drop-shadow-[0_0_6px_rgba(255,209,102,0.6)]"
              : "text-forest-muted"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}
