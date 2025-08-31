import { ReactNode } from "react";

interface ToolbarProps {
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  className?: string;
}

export function Toolbar({
  leftActions,
  rightActions,
  className = "",
}: ToolbarProps) {
  return (
    <div className={`bg-slate-800 border-b border-slate-700 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">{leftActions}</div>

        <div className="flex items-center gap-3">{rightActions}</div>
      </div>
    </div>
  );
}
