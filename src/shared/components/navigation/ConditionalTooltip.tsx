// =============================================
// components/common/ConditionalTooltip.tsx
// =============================================
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/components/tooltip.tsx";

interface ConditionalTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  show?: boolean;
}

export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = ({
  children,
  content,
  show = true,
}) => {
  if (!show) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="mytick-theme">{content}</TooltipContent>
    </Tooltip>
  );
};


