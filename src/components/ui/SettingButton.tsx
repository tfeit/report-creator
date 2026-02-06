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
        className="flex items-center gap-2 rounded-full border border-gray-700/60 text-gray-600 dark:text-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
    >
        {dropdownLabel}
        {icon && React.createElement(icon, { className: "w-4 h-4" })}
    </button>
    )
}