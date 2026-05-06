import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, interactive = false, onRate, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
