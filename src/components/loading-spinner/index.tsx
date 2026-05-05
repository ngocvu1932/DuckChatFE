import React from 'react';

interface ILoadingSpinnerProps {
  size?: number;
  color?: string;
}

const sizeClassMap: Record<number, string> = {
  30: 'h-[30px] w-[30px]',
  50: 'h-[50px] w-[50px]',
};

const colorClassMap: Record<string, string> = {
  gray: 'border-t-slate-400',
  sky: 'border-t-sky-500',
};

const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({size = 30, color = 'gray'}) => {
  const sizeClass = sizeClassMap[size] ?? sizeClassMap[30];
  const colorClass = colorClassMap[color] ?? colorClassMap.gray;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className={`${sizeClass} ${colorClass} animate-spin rounded-full border-4 border-transparent`} />
    </div>
  );
};

export default LoadingSpinner;
