import React from 'react';

interface IAvatarProps {
  src: string;
  online?: boolean;
  size?: string;
}

const Avatar: React.FC<IAvatarProps> = ({src, online = false, size = '45'}) => {
  return (
    <div className="flex relative">
      <img
        src={src}
        alt="avatar"
        className="rounded-full border border-gray-400"
        style={{width: `${size}px`, height: `${size}px`}}
      />
      {online && (
        <div className="absolute bottom-0 right-0 bg-[#4CAF50] rounded-full w-4 h-4 border border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
