import React from 'react';

type TRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

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
  return (
    <span title={title} className={`${className} flex items-center rounded-${rounded} relative`}>
      {prefix && (
        <span className="absolute left-3 flex items-center h-full text-gray-500 pointer-events-none">{prefix}</span>
      )}
      <input
        onKeyDown={onKeyDown}
        spellCheck="false"
        disabled={disabled}
        value={value}
        onChange={(e) => changeText && changeText(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={`${prefix ? 'pl-9' : ''} ${
          suffix ? 'pr-9' : ''
        } w-full h-full px-3 py-2 border border-slate-300 rounded-${rounded} hover:border-blue-500 focus:outline-none focus:ring-blue-500`}
      />
      {suffix && <span className="absolute right-3 flex items-center h-full text-gray-500">{suffix}</span>}
    </span>
  );
};

export default TextInput;
