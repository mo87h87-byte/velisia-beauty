import { toNumber } from "@/lib/format";

export default function StarRating({
  rating,
  size = 14,
  className = "",
}: {
  rating: number | string;
  size?: number;
  className?: string;
}) {
  const value = toNumber(rating);
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = i === full && hasHalf;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={filled || half ? "text-amber-400" : "text-blush-200"}
          >
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#f7d4db" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M12 17.27l-5.18 3.05 1.4-5.88-4.56-3.96 6.01-.5L12 4l2.33 5.98 6.01.5-4.56 3.96 1.4 5.88z"
                />
              </>
            ) : (
              <path
                fill="currentColor"
                d="M12 17.27l-5.18 3.05 1.4-5.88-4.56-3.96 6.01-.5L12 4l2.33 5.98 6.01.5-4.56 3.96 1.4 5.88z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}
