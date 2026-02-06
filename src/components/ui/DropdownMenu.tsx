"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import { useState, useEffect, useRef, ComponentType } from "react";
import { createPortal } from "react-dom";

export interface Action {
  type: "button" | "divider";
  label?: string;
  onClick?: (row?: any) => void;
  icon?: ComponentType<{ className?: string }>;
  getDisabled?: boolean;
  danger?: boolean;
}

interface DropdownMenuProps {
  actions: Action[];
  buttonTitle?: string;
  outline?: boolean;
  className?: string;
  icon?: ComponentType<{ className?: string }>;
  position?: "left" | "right";
  dropdownWidth?: string;
  renderMode?: "portal" | "absolute";
  buttonSize?: "small" | "regular" | "medium" | "fullwidth" | "square" | "squarelg";
  buttonRounded?: "medium" | "full" | "none";
  buttonClassName?: string;
  buttonColor?: "blue" | "white" | "transparent" | "gray" | "red";
}

interface DropdownPosition {
  top: number;
  left: number;
}

export default function DropdownMenu({
  actions,
  buttonTitle = "",
  outline = true,
  className = "",
  icon = EllipsisVerticalIcon,
  position = "right",
  dropdownWidth = "w-fit",
  renderMode = "portal",
  buttonSize = "square",
  buttonRounded = "medium",
  buttonClassName = "",
  buttonColor = "transparent"
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const usePortal = renderMode === "portal";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.addEventListener("wheel", handleWheel, { passive: false, capture: true });

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("scroll", handleScroll, true);
        document.removeEventListener("wheel", handleWheel, { capture: true } as EventListenerOptions);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (usePortal && isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const pos: DropdownPosition = {
        top: rect.bottom + 4,
        left:
          position === "right"
            ? rect.right - (dropdownRef.current?.offsetWidth || 0)
            : rect.left
      };
      setDropdownPosition(pos);
    }
  }, [isOpen, position, usePortal]);

  return (
    <div className={`relative ${className}`}>
      <div ref={buttonRef}>
        <Button
          size="square"
          variant={outline ? "outlined" : "filled"}
          color="transparent"
          rounded="full"
          onClick={toggleDropdown}
          icon={icon}
          className={buttonClassName}
        >
          {buttonTitle}
        </Button>
      </div>
      {isOpen && usePortal && isMounted &&
        createPortal(
          <div
            className={`fixed ${dropdownWidth} min-w-52 max-w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 shadow-lg z-50 rounded-xl overflow-hidden flex flex-col max-h-80 overflow-y-auto`}
            ref={dropdownRef}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <div className="py-1.5">
              {actions.map((action, index) =>
                action.type === "button" ? (
                  <button
                    key={index}
                    type="button"
                    className={`flex w-full cursor-pointer text-left border-0 bg-transparent px-3 py-2.5 text-sm font-medium justify-start items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                        ${action.danger
                        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 focus:bg-gray-100 dark:focus:bg-gray-700/80"
                      }`}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                    disabled={action.getDisabled}
                  >
                    {action.icon && (
                      <span className={action.danger ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}>
                        <action.icon className="w-4 h-4 shrink-0" />
                      </span>
                    )}
                    <span className="truncate">{action.label}</span>
                  </button>
                ) : action.type === "divider" ? (
                  <div key={index} className="my-1 border-t border-gray-200 dark:border-gray-600" role="separator" />
                ) : null
              )}
            </div>
          </div>,
          document.body
        )}
      {isOpen && !usePortal && (
        <div
          className={`absolute ${dropdownWidth} min-w-52 max-w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 shadow-lg z-99 rounded-xl overflow-hidden flex flex-col max-h-80 overflow-y-auto mt-1 ${position === "right" ? "right-0" : "left-0"}`}
          ref={dropdownRef}
        >
          <div className="py-1.5">
            {actions.map((action, index) =>
              action.type === "button" ? (
                <button
                  key={index}
                  type="button"
                  className={`flex w-full cursor-pointer text-left border-0 bg-transparent px-3 py-2.5 text-sm font-medium justify-start items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                        ${action.danger
                        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 focus:bg-gray-100 dark:focus:bg-gray-700/80"
                      }`}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={action.getDisabled}
                >
                  {action.icon && (
                    <span className={action.danger ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}>
                      <action.icon className="w-4 h-4 shrink-0" />
                    </span>
                  )}
                  <span className="truncate">{action.label}</span>
                </button>
              ) : action.type === "divider" ? (
                <div key={index} className="my-1 border-t border-gray-200 dark:border-gray-600" role="separator" />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
