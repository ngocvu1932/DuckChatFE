import React from 'react';

type TRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const roundedClassMap: Record<TRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

interface ITextInputProps {
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute | 'text';
  className?: React.HTMLAttributes<HTMLInputElement>['className'];
  changeText?: (text: string) => void;
  value?: string;
  disabled?: boolean;
  title?: string;
  rounded?: TRounded;
}

const TextInput: React.FC<ITextInputProps> = ({
  onKeyDown,
  prefix,
  suffix,
  placeholder,
  type,
  className,
  changeText,
  value,
  disabled,
  title,
  rounded = 'none',
}) => {
  const roundedClass = roundedClassMap[rounded];

  return (
    <span title={title} className={`${className ?? ''} group relative flex items-center ${roundedClass}`}>
      {prefix && (
        <span className="absolute left-4 flex items-center h-full text-slate-400 transition-colors duration-200 pointer-events-none group-focus-within:text-sky-500">
          {prefix}
        </span>
      )}
      <input
        onKeyDown={onKeyDown}
        spellCheck="false"
        disabled={disabled}
        value={value}
        onChange={(e) => changeText && changeText(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={`${prefix ? 'pl-11' : ''} ${
          suffix ? 'pr-9' : ''
        } h-full w-full border border-slate-200 bg-white/95 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm shadow-slate-200/60 placeholder:text-slate-400 ${roundedClass} transition-all duration-200 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100/70 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
      />
      {suffix && <span className="absolute right-4 flex items-center h-full text-slate-400">{suffix}</span>}
    </span>
  );
};

export default TextInput;
