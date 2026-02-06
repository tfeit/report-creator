import React from "react";

interface SettingButtonProps {
    dropdownLabel: string;
    action: boolean;
    setAction: (current: boolean) => void;
    icon: React.ComponentType<{ className?: string }>;
}

export default function SettingButton(
    { dropdownLabel, action, setAction, icon }: SettingButtonProps ) {
  return (
    <button
        type="button"
        onClick={() => setAction(!action)}
        className="setting-button"
    >
        {dropdownLabel}
        {icon && React.createElement(icon, { className: "w-4 h-4" })}
    </button>
    )
}