"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Asset } from "@/types/asset";
import type { BirthdayPerson } from "@/types/birthday";
import type { BirthdayBlockPosition, ReportFormat } from "@/types/report";
import { monthNames } from "@/lib/dateUtils";
import { getReportFormat } from "@/lib/reportFormats";
import { DraggableBirthdayBlock } from "@/components/DraggableBirthdayBlock";
import { ExportButton } from "@/components/ExportButton";

type ReportCanvasProps = {
  month: number;
  template?: Asset;
  people: BirthdayPerson[];
  generated: boolean;
  format: ReportFormat;
  startPercent: number;
  startXPercent: number;
  showMonthName: boolean;
  monthNameXPercent: number;
  monthNameYPercent: number;
};

const blockRatio = 170 / 226;

type BlockLayout = {
  width: number;
  height: number;
  positions: Pick<BirthdayBlockPosition, "x" | "y">[];
  horizontalPadding: number;
  topOffset: number;
};

type CanvasMetrics = {
  width: number;
  height: number;
  scale: number;
  horizontalPadding: number;
  horizontalOffset: number;
  topPadding: number;
  topOffset: number;
  bottomPadding: number;
  maxBlockWidth: number;
};

function buildCanvasMetrics(width: number, height: number, startPercent: number, startXPercent: number): CanvasMetrics {
  const scale = Math.min(width / 1080, height / 1080);
  const horizontalPadding = Math.round(Math.max(44, width * 0.045));
  const horizontalOffset = Math.round(width * (startXPercent / 100));
  const topPadding = Math.round(44 * scale);
  const topOffset = Math.round(height * (startPercent / 100));
  const bottomPadding = Math.round(Math.max(44, height * 0.035));
  const maxBlockWidth = Math.round(170 * scale);

  return { width, height, scale, horizontalPadding, horizontalOffset, topPadding, topOffset, bottomPadding, maxBlockWidth };
}

function buildBlockLayout(count: number, metrics: CanvasMetrics): BlockLayout {
  const startX = Math.max(0, Math.min(metrics.horizontalOffset, metrics.width - metrics.horizontalPadding));

  if (count === 0) {
    return {
      width: metrics.maxBlockWidth,
      height: Math.round(metrics.maxBlockWidth / blockRatio),
      positions: [],
      horizontalPadding: startX,
      topOffset: metrics.topOffset
    };
  }

  const availableWidth = metrics.width - startX - metrics.horizontalPadding;
  const availableHeight = metrics.height - metrics.topOffset - metrics.bottomPadding;
  const gap = Math.round(14 * metrics.scale);
  const minWidth = Math.max(96, Math.round(96 * Math.min(metrics.scale, 1.75)));
  let columns = Math.max(1, Math.floor((availableWidth + gap) / (metrics.maxBlockWidth + gap)));
  columns = Math.min(columns, count);

  let rows = Math.ceil(count / columns);
  let width = Math.min(metrics.maxBlockWidth, (availableWidth - gap * (columns - 1)) / columns);
  let height = width / blockRatio;
  const maxHeightByRows = (availableHeight - gap * (rows - 1)) / rows;

  if (height > maxHeightByRows) {
    height = Math.max(minWidth / blockRatio, maxHeightByRows);
    width = height * blockRatio;
  }

  const positions = Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      x: Math.round(startX + column * (width + gap)),
      y: Math.round(metrics.topOffset + row * (height + gap))
    };
  });

  return {
    width: Math.round(width),
    height: Math.round(height),
    positions,
    horizontalPadding: startX,
    topOffset: metrics.topOffset
  };
}

export function ReportCanvas({
  month,
  template,
  people,
  generated,
  format,
  startPercent,
  startXPercent,
  showMonthName,
  monthNameXPercent,
  monthNameYPercent
}: ReportCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const formatConfig = useMemo(() => getReportFormat(format), [format]);
  const metrics = useMemo(() => buildCanvasMetrics(formatConfig.width, formatConfig.height, startPercent, startXPercent), [
    formatConfig.height,
    formatConfig.width,
    startPercent,
    startXPercent
  ]);
  const previewScale = Math.min(1, 1080 / metrics.width, 1180 / metrics.height);
  const [positions, setPositions] = useState<BirthdayBlockPosition[]>([]);
  const blockLayout = useMemo(() => buildBlockLayout(people.length, metrics), [metrics, people.length]);

  useEffect(() => {
    if (!generated) {
      return;
    }

    const next = people.map((person, index) => {
      const fallback = blockLayout.positions[index] ?? {
        x: blockLayout.horizontalPadding,
        y: blockLayout.topOffset
      };
      return { birthdayId: person.id, ...fallback };
    });

    setPositions(next);
  }, [blockLayout, generated, people]);

  function handleMove(birthdayId: string, x: number, y: number) {
    setPositions((current) =>
      current.map((position) => (position.birthdayId === birthdayId ? { ...position, x, y } : position))
    );
  }

  if (!generated) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Selecione mes e template para gerar a arte.
      </div>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Arte de {monthNames[month - 1]} - {formatConfig.shortLabel}
          </h2>
          <p className="text-sm text-slate-600">
            {people.length} aniversariante(s) em {formatConfig.width} x {formatConfig.height} px.
          </p>
        </div>
        <ExportButton
          targetRef={ref}
          disabled={!template || people.length === 0}
          fileName={`aniversariantes-${month}-${format}.png`}
          pixelRatio={formatConfig.exportPixelRatio}
        />
      </div>
      <div className="w-full overflow-auto rounded-md border border-line bg-slate-200 p-4 shadow-soft">
        <div
          className="relative mx-auto bg-white shadow-soft"
          style={{
            height: Math.round(metrics.height * previewScale),
            width: Math.round(metrics.width * previewScale)
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              height: metrics.height,
              transform: `scale(${previewScale})`,
              width: metrics.width
            }}
          >
            <div
              ref={ref}
              className="report-export-surface relative overflow-hidden bg-white"
              style={{
                backgroundImage: template ? `url(${template.imageDataUrl})` : undefined,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                height: metrics.height,
                width: metrics.width
              }}
            >
          {showMonthName ? (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap font-bold uppercase text-black"
              style={{
                fontSize: Math.round(48 * metrics.scale),
                left: `${monthNameXPercent}%`,
                lineHeight: 1,
                textShadow: "0 2px 8px rgba(255, 255, 255, 0.65)",
                top: `${monthNameYPercent}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              {monthNames[month - 1]}
            </div>
          ) : null}
          {people.length === 0 ? (
            <div
              className="absolute rounded-md bg-black/40 text-center font-semibold text-white"
              style={{
                fontSize: Math.round(24 * metrics.scale),
                left: metrics.horizontalPadding,
                padding: Math.round(32 * metrics.scale),
                right: metrics.horizontalPadding,
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.65)",
                top: "50%"
              }}
            >
              Nenhum aniversariante cadastrado para este mes.
            </div>
          ) : (
            people.map((person, index) => {
              const position = positions.find((item) => item.birthdayId === person.id) ?? {
                birthdayId: person.id,
                ...(blockLayout.positions[index] ?? {
                  x: blockLayout.horizontalPadding,
                  y: blockLayout.topOffset
                })
              };
              return (
                <DraggableBirthdayBlock
                  key={person.id}
                  person={person}
                  x={position.x}
                  y={position.y}
                  width={blockLayout.width}
                  height={blockLayout.height}
                  fontScale={metrics.scale}
                  scale={previewScale}
                  onMove={handleMove}
                />
              );
            })
          )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
