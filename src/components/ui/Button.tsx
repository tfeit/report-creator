import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  name?: string;
  type?: "button" | "submit" | "reset";
  variant?: "filled" | "outlined";
  color?: "blue" | "transparent";
  size?: "square" | "regular";
  rounded?: "medium" | "full";
  selected?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }> | null;
}

export default function Button({
  children,
  name = "",
  type = "button",
  variant = "filled",
  color = "blue",
  size = "regular",
  rounded = "medium",
  selected = false,
  disabled = false,
  onClick = () => {},
  className = "",
  icon = null,
}: ButtonProps) {
  const baseStyles =
    "flex justify-center items-center cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-default transition-all duration-300 whitespace-nowrap";

  const getBorderStyles = (
    borderColor: string,
    hoverColor: string,
    darkBorderColor: string = "gray-500"
  ) => {
    const darkClasses =
      darkBorderColor === "white"
        ? "dark:border-white dark:hover:border-gray-300"
        : "dark:border-gray-500 dark:hover:border-gray-400";
    return `border-1 border-${borderColor} hover:border-${hoverColor} ${darkClasses}`;
  };

  const variantStyles: Record<string, Record<string, string>> = {
    filled: {
      blue: `bg-(--color-blue) ${getBorderStyles(
        "[var(--color-blue)]",
        "[var(--color-darkblue)]",
        "white"
      )} text-white hover:bg-[var(--color-darkblue)]`,
      transparent: `bg-transparent hover:bg-gray-100 ${selected ? "bg-gray-100" : ""}`
    },
    outlined: {
      blue: `${getBorderStyles(
        "[var(--color-blue)]",
        "[var(--color-darkblue)]",
        "white"
      )} text-(--color-blue) dark:text-white hover:text-[var(--color-darkblue)]`,
      transparent: `${getBorderStyles("gray-300", "gray-400")} hover:bg-black/05 dark:hover:bg-white/10 ${selected ? "bg-black/05 dark:bg-white/10" : ""}`
    }
  };

  const sizeStyles: Record<string, string> = {
    regular: "px-3 py-2 h-10 text-sm font-regular leading-6 w-fit",
    square: "p-2 text-xs font-light tracking-tight w-fit my-auto"
  };

  const roundedStyles: Record<string, string> = {
    medium: "rounded-md",
    full: "rounded-full"
  };

  return (
    <button
      title={name}
      type={type}
      disabled={disabled}
      className={`button button--${variant} button--${color} ${selected ? "selected" : ""} ${baseStyles} ${variantStyles[variant][color]} ${sizeStyles[size]} ${roundedStyles[rounded]} ${className}`}
      onClick={onClick}
    >
      {icon &&
        React.createElement(icon, {
          className: `w-5 h-5 ${selected ? "text-(--color-blue)" : ""}`
        })}
      {children}
    </button>
  );
}
