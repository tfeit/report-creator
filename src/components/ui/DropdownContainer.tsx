"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import { useState, useEffect, useRef, ComponentType } from "react";

interface DropdownContainerProps {
  className?: string;
  icon?: ComponentType<{ className?: string }>;
  position?: "left" | "right";
  dropdownWidth?: string;
  content?: React.ReactNode;
  lockBodyScroll?: boolean;
}

export default function DropdownContainer({
  className = "",
  icon = EllipsisVerticalIcon,
  position = "right",
  dropdownWidth = "w-fit",
  content = null,
  lockBodyScroll = true
}: DropdownContainerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (lockBodyScroll) {
        document.addEventListener("scroll", handleScroll, true);
        document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      }

      const originalOverflow = document.body.style.overflow;
      if (lockBodyScroll) {
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        if (lockBodyScroll) {
          document.removeEventListener("scroll", handleScroll, true);
          document.removeEventListener("wheel", handleWheel, { capture: true } as EventListenerOptions);
          document.body.style.overflow = originalOverflow;
        }
      };
    }
  }, [isOpen, lockBodyScroll]);

  return (
    <div className={`relative ${className}`}>
      <div ref={buttonRef}>
        <Button
          size="square"
          variant="outlined"
          color="transparent"
          rounded="full"
          onClick={toggleDropdown}
          icon={icon}
        />
      </div>
      {isOpen && (
        <div
          className={`absolute ${dropdownWidth} min-w-52 max-w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 shadow-lg z-99 rounded-xl overflow-hidden flex flex-col max-h-80 overflow-y-auto mt-1 p-2 ${position === "right" ? "right-0" : "left-0"}`}
          ref={dropdownRef}
        >
          {content}
        </div>
      )}
    </div>
  );
}
