"use client";

import React, { useEffect, useState, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Portal from "../Portal";

interface PopupProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  onClick?: () => void;
  onBack?: () => void;
  onClickTitle?: string | React.ReactNode;
  onBackTitle?: string;
}

const Popup: React.FC<PopupProps> = ({
  title = "",
  onClose,
  children,
  onClick,
  onBack,
  onClickTitle,
  onBackTitle,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [backgroundClosing, setBackgroundClosing] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [popupReady, setPopupReady] = useState(false);
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setBackgroundClosing(true);
    }, 100);
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    setTimeout(() => {
      setBackgroundReady(true);
    }, 10);
    setTimeout(() => {
      setPopupReady(true);
    }, 260);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  const hasFooter = onBack || onClick;

  const backgroundClasses = [
    "report-popup-background",
    "popup-bg",
    backgroundReady ? "popup-ready" : "",
    backgroundClosing ? "popup-removing" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const popupClasses = [
    "report-popup",
    "padding-medium",
    "popup",
    popupReady ? "popup-ready" : "",
    isClosing ? "popup-removing" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Portal>
      <div className={backgroundClasses}>
        <div className={popupClasses}>
          <div className="popup-header-title">
            {title && <h3 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{title}</h3>}
            <button onClick={handleClose}>
              <XMarkIcon />
            </button>
          </div>
          <div className="report-popup-content">
            {children}
          </div>
          {hasFooter && (
            <div className="report-popup-footer">
              {onBack && (
                <button className="button-back" onClick={onBack}>
                  {onBackTitle}
                </button>
              )}
              {onClick && (
                <button onClick={onClick} className="button-click">
                  {onClickTitle}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default Popup;
