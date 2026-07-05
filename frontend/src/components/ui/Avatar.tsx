import { getInitials, cn } from '../../lib/utils';

export const Avatar = ({
  name,
  src,
  className,
  size = 40,
}: {
  name: string;
  src?: string;
  className?: string;
  size?: number;
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={cn('rounded-full object-cover border border-white/10', className)}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold',
        className
      )}
    >
      <span style={{ fontSize: size * 0.38 }}>{getInitials(name)}</span>
    </div>
  );
};
