import { useCountUp } from '../../hooks/useCountUp';

export const AnimatedCounter = ({
  value,
  suffix = '',
  prefix = '',
  duration = 1500,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) => {
  const count = useCountUp(value, duration);
  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
