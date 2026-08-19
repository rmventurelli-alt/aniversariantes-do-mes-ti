"use client";

import { RefObject, useState } from "react";
import { Download } from "lucide-react";
import { exportNodeAsPng } from "@/lib/exportPng";

type ExportButtonProps = {
  targetRef: RefObject<HTMLDivElement>;
  disabled?: boolean;
  fileName: string;
  pixelRatio?: number;
};

export function ExportButton({ targetRef, disabled, fileName, pixelRatio = 1 }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!targetRef.current) {
      return;
    }

    setExporting(true);
    try {
      await exportNodeAsPng(targetRef.current, fileName, pixelRatio);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || exporting}
      onClick={handleExport}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download aria-hidden="true" size={17} />
      {exporting ? "Exportando" : "Exportar PNG"}
    </button>
  );
}
