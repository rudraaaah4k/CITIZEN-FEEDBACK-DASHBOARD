import { useEffect, useRef, useState } from 'react';

export function useCountUp(end: number, duration = 1500, start = 0) {
  const [value, setValue] = useState(start);
  const frame = useRef<number>();

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        frame.current = requestAnimationFrame(animate);
      }
    };
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [end, duration, start]);

  return value;
}
