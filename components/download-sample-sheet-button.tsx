"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadSampleSheet } from "@/lib/download-sample-sheet";

export function DownloadSampleSheetButton({
  variant = "secondary",
  size = "sm",
  className,
  label = "Download Sample Sheet",
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => downloadSampleSheet()}
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}
