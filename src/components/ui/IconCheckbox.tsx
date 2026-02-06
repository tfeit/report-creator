import React from "react";

interface IconCheckboxProps {
  icon?: React.ReactElement;
  iconPosition?: "top" | "left" | "right" | "bottom";
  label: string;
  isChecked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: string | number;
  description?: string;
  disabled?: boolean;
  fontWeight?: "font-regular" | "font-medium" | "font-bold";
}

export default function IconCheckbox({
  icon,
  iconPosition = "top",
  label,
  isChecked,
  onChange,
  id,
  description = "",
  fontWeight = "font-regular",
  disabled = false
}: IconCheckboxProps) {
  const fontWeightClassMap: Record<IconCheckboxProps["fontWeight"], string> = {
    "font-regular": "icon-checkbox__label--regular",
    "font-medium": "icon-checkbox__label--medium",
    "font-bold": "icon-checkbox__label--bold"
  };

  const labelClassName = [
    "icon-checkbox",
    isChecked ? "icon-checkbox--checked" : "",
    disabled ? "icon-checkbox--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const contentClassName = [
    "icon-checkbox__content",
    iconPosition === "top"
      ? "icon-checkbox__content--top"
      : "icon-checkbox__content--row",
    isChecked ? "icon-checkbox__content--checked" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const descriptionClassName = [
    "icon-checkbox__description",
    isChecked ? "icon-checkbox__description--checked" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const labelWeightClassName =
    fontWeightClassMap[fontWeight ?? "font-regular"];

  return (
    <label
      className={labelClassName}
    >
      <input
        type="checkbox"
        className="icon-checkbox__input"
        value={id}
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <div
        className={contentClassName}
      >
        {icon && icon}
        <span className={`icon-checkbox__label ${labelWeightClassName}`}>
          {label}
        </span>
      </div>
      {description && (
        <div className={descriptionClassName}>
          {description}
        </div>
      )}
    </label>
  );
}
