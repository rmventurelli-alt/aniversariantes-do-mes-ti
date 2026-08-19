"use client";

import { ChangeEvent, FormEvent } from "react";
import { ImagePlus, Save, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/imageUpload";

export type AssetFormValues = {
  name: string;
  imageDataUrl: string;
};

type AssetUploadFormProps = {
  title: string;
  values: AssetFormValues;
  editingId: string;
  onChange: (values: AssetFormValues) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export const emptyAssetForm: AssetFormValues = {
  name: "",
  imageDataUrl: ""
};

export function AssetUploadForm({
  title,
  values,
  editingId,
  onChange,
  onSubmit,
  onClear
}: AssetUploadFormProps) {
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onChange({ ...values, imageDataUrl: await fileToDataUrl(file) });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-cloud p-4 transition hover:border-brand">
          {values.imageDataUrl ? (
            <img src={values.imageDataUrl} alt="" className="max-h-40 max-w-full rounded-md object-contain" />
          ) : (
            <>
              <ImagePlus aria-hidden="true" size={32} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Upload do arquivo</span>
            </>
          )}
          <input className="sr-only" type="file" accept="image/*" onChange={handleFile} />
        </label>
        <div className="grid content-start gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              className="h-11 rounded-md border border-line px-3"
              value={values.name}
              onChange={(event) => onChange({ ...values, name: event.target.value })}
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Save aria-hidden="true" size={17} />
              {editingId ? "Salvar edicao" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-700 hover:bg-cloud"
            >
              <X aria-hidden="true" size={17} />
              Limpar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
