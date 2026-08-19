"use client";

import type { Asset } from "@/types/asset";
import type { ReportSelection } from "@/types/report";
import { monthNames } from "@/lib/dateUtils";
import { reportFormats } from "@/lib/reportFormats";
import { Wand2 } from "lucide-react";

type ReportGeneratorFormProps = {
  templates: Asset[];
  selection: ReportSelection;
  onChange: (selection: ReportSelection) => void;
  onGenerate: () => void;
};

export function ReportGeneratorForm({ templates, selection, onChange, onGenerate }: ReportGeneratorFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
      className="rounded-md border border-line bg-white p-5 shadow-soft"
    >
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1.25fr_1.25fr_auto] xl:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Mes do relatorio</span>
          <select
            className="h-11 rounded-md border border-line px-3"
            value={selection.month}
            onChange={(event) => onChange({ ...selection, month: Number(event.target.value) })}
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Formato</span>
          <select
            className="h-11 rounded-md border border-line px-3"
            value={selection.format}
            onChange={(event) => onChange({ ...selection, format: event.target.value as ReportSelection["format"] })}
          >
            {reportFormats.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Template cadastrado</span>
          <select
            className="h-11 rounded-md border border-line px-3"
            value={selection.templateId}
            onChange={(event) => onChange({ ...selection, templateId: event.target.value })}
          >
            <option value="">Selecione um template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Wand2 aria-hidden="true" size={17} />
          Gerar Arte
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Aniversariantes Horizontal
            <span className="text-xs font-semibold text-brand">{selection.startXPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={45}
            step={1}
            value={selection.startXPercent}
            onChange={(event) => onChange({ ...selection, startXPercent: Number(event.target.value) })}
            className="accent-brand"
          />
        </label>
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Aniversariantes Vertical
            <span className="text-xs font-semibold text-brand">{selection.startPercent}%</span>
          </span>
          <input
            type="range"
            min={5}
            max={45}
            step={1}
            value={selection.startPercent}
            onChange={(event) => onChange({ ...selection, startPercent: Number(event.target.value) })}
            className="accent-brand"
          />
        </label>
        <label className="flex h-11 items-center gap-3 self-end rounded-md border border-line px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={selection.showMonthName}
            onChange={(event) => onChange({ ...selection, showMonthName: event.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          Mostrar nome do mes
        </label>
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Mes horizontal
            <span className="text-xs font-semibold text-brand">{selection.monthNameXPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={selection.monthNameXPercent}
            disabled={!selection.showMonthName}
            onChange={(event) => onChange({ ...selection, monthNameXPercent: Number(event.target.value) })}
            className="accent-brand disabled:opacity-45"
          />
        </label>
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Mes vertical
            <span className="text-xs font-semibold text-brand">{selection.monthNameYPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={45}
            step={1}
            value={selection.monthNameYPercent}
            disabled={!selection.showMonthName}
            onChange={(event) => onChange({ ...selection, monthNameYPercent: Number(event.target.value) })}
            className="accent-brand disabled:opacity-45"
          />
        </label>
      </div>
    </form>
  );
}
