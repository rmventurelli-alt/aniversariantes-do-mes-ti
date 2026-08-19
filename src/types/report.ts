export type ReportFormat = "square" | "a3-portrait" | "a3-landscape";

export type ReportSelection = {
  month: number;
  templateId: string;
  format: ReportFormat;
  startPercent: number;
  startXPercent: number;
  showMonthName: boolean;
  monthNameXPercent: number;
  monthNameYPercent: number;
};

export type BirthdayBlockPosition = {
  birthdayId: string;
  x: number;
  y: number;
};
