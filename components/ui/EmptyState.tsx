import { CircleAlert, RotateCcw } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  text: string;
  retry?: boolean;
  onClick?: () => void;
  buttonText?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}

export default function EmptyState({
  text,
  retry = false,
  onClick,
  buttonText,
  Icon,
}: EmptyStateProps) {
  const showButton = retry || Icon || buttonText;

  return (
    <div className="flex w-full h-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <CircleAlert className="text-foreground w-16 h-16" />
        <p className="text-foreground text-center text-base">{text}</p>
      </div>

      {showButton && (
        <button
          onClick={onClick}
          className="flex items-center gap-2 rounded bg-foreground px-4 py-2 text-background"
        >
          {retry && <RotateCcw className="w-4 h-4" />}
          {Icon && <Icon className="w-4 h-4" />}
          {buttonText && <span>{buttonText}</span>}
        </button>
      )}
    </div>
  );
}
