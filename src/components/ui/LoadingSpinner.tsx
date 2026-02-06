'use client';

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large" | "xl";
  className?: string;
}

export default function LoadingSpinner({
  size = "medium",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center h-full ${className}`}>
      <div className={`lds-ring ${size}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
