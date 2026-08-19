import type { ReportFormat } from "@/types/report";

export type ReportFormatConfig = {
  id: ReportFormat;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  exportPixelRatio: number;
};

export const reportFormats: ReportFormatConfig[] = [
  {
    id: "a3-portrait",
    label: "A3 retrato - 3508 x 4961 px",
    shortLabel: "A3 retrato",
    width: 3508,
    height: 4961,
    exportPixelRatio: 1
  },
  {
    id: "a3-landscape",
    label: "A3 paisagem - 4961 x 3508 px",
    shortLabel: "A3 paisagem",
    width: 4961,
    height: 3508,
    exportPixelRatio: 1
  },
  {
    id: "square",
    label: "Digital quadrado - 1080 x 1080 px",
    shortLabel: "Digital quadrado",
    width: 1080,
    height: 1080,
    exportPixelRatio: 2
  }
];

export function getReportFormat(format: ReportFormat) {
  return reportFormats.find((item) => item.id === format) ?? reportFormats[0];
}
