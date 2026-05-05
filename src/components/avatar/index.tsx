import React from 'react';

interface IAvatarProps {
  src: string;
  online?: boolean;
  size?: string;
}

const sizeClassMap: Record<string, string> = {
  '18': 'h-[18px] w-[18px]',
  '32': 'h-8 w-8',
  '40': 'h-10 w-10',
  '45': 'h-[45px] w-[45px]',
  '50': 'h-[50px] w-[50px]',
  '55': 'h-[55px] w-[55px]',
};

const Avatar: React.FC<IAvatarProps> = ({src, online = false, size = '45'}) => {
  const sizeClass = sizeClassMap[size] ?? sizeClassMap['45'];

  return (
    <div className="relative flex shrink-0">
      <img
        src={src}
        alt="avatar"
        className={`${sizeClass} rounded-full border-2 border-white bg-slate-100 object-cover shadow-md shadow-slate-200`}
      />
      {online && (
        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"></div>
      )}
    </div>
  );
};

export default Avatar;
