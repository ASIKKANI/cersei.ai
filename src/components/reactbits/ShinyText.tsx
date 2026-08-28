import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block ${
        disabled
          ? 'text-slate-900'
          : 'bg-gradient-to-r from-sky-700 via-sky-500 via-blue-600 to-sky-700 bg-[length:200%_auto] bg-clip-text text-transparent'
      } ${className}`}
      style={{
        animation: disabled ? 'none' : `shimmer ${animationDuration} linear infinite`,
      }}
    >
      {text}
    </span>
  );
};
