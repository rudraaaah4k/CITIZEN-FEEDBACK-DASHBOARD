import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = 24,
}: {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: number;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={cn('transition-transform', !readOnly && 'hover:scale-110 cursor-pointer')}
        >
          <Star
            size={size}
            className={cn(
              (hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
};
