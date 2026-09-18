"use client";

import { cn } from "@/lib/utils";

/** Lightweight tooltip for collapsed sidebar icons */
export function Tooltip({
  label,
  children,
  side = "right",
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  side?: "right" | "bottom";
  disabled?: boolean;
}) {
  if (disabled) return <>{children}</>;

  return (
    <span className="group/tip relative flex w-full">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-[60] whitespace-nowrap rounded-md bg-[#0b1220] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition duration-150",
          "group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          side === "right" &&
            "left-full top-1/2 ml-3 -translate-y-1/2 translate-x-0",
          side === "bottom" &&
            "left-1/2 top-full mt-2 -translate-x-1/2",
        )}
      >
        {label}
        <span
          className={cn(
            "absolute h-2 w-2 rotate-45 bg-[#0b1220]",
            side === "right" && "left-0 top-1/2 -ml-1 -translate-y-1/2",
            side === "bottom" && "left-1/2 top-0 -mt-1 -translate-x-1/2",
          )}
        />
      </span>
    </span>
  );
}
