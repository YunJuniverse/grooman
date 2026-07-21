import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Elevation = "flat" | "raised" | "overlay";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
}

// 토큰만 소비 — 배경/테두리/그림자 모두 토큰 역할로
const ELEVATIONS: Record<Elevation, string> = {
  flat: "bg-surface-raised border border-border-subtle",
  raised: "bg-surface-raised border border-border-default shadow-sm",
  overlay: "bg-surface-overlay border border-border-default shadow-lg",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = "raised", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg p-4 text-text-primary",
        ELEVATIONS[elevation],
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
