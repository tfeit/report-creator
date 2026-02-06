import React, { useEffect, useState } from "react";

interface InputProps {
  label?: string;
  labelPosition?: "top" | "left";
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  regex?: RegExp;
  autoFocus?: boolean;
  readOnly?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  labelPosition = "top",
  name,
  value,
  onChange,
  onValidationChange,
  placeholder,
  min,
  max,
  step,
  regex,
  type = "text",
  required = false,
  className = "gap-1 w-full",
  autoFocus = false,
  readOnly = false,
  onKeyDown
}) => {
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  useEffect(() => {
    if (regex && typeof value === "string") {
      const valid = regex.test(value);
      setIsValid(valid);
      onValidationChange?.(valid);
    }
  }, [value, regex, onValidationChange]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true);
  };

  const shouldShowError = !isFocused && hasBlurred && value && regex && !isValid;

  return (
    <div id="form-field" className={`${labelPosition === "left" ? "grid grid-cols-2 gap-2 items-center" : "flex flex-col"} ${className}`}>
      {label && (
        <label className="text-sm font-medium" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        className="text-sm px-2 py-1.5 border rounded-md w-full border-gray-200 dark:border-gray-500 bg-transparent"
        value={value}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        pattern={regex?.source}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
      {shouldShowError && <span className="text-red-200 text-xs">Ungültiges Format</span>}
    </div>
  );
};

export default Input;
