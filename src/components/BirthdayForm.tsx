"use client";

import { ChangeEvent, FormEvent } from "react";
import { ImagePlus, Save, Sparkles, Trash2, X } from "lucide-react";
import { adaptPhotoToDataUrl } from "@/lib/imageUpload";

export type BirthdayFormValues = {
  photoDataUrl: string;
  name: string;
  role: string;
  whatsapp: string;
  birthday: string;
};

type BirthdayFormProps = {
  values: BirthdayFormValues;
  selectedId: string;
  onChange: (values: BirthdayFormValues) => void;
  onNew: () => void;
  onClear: () => void;
  onSave: () => void;
  onDelete: () => void;
  onImageError: (message: string) => void;
};

export const emptyBirthdayForm: BirthdayFormValues = {
  photoDataUrl: "",
  name: "",
  role: "",
  whatsapp: "",
  birthday: ""
};

export function BirthdayForm({
  values,
  selectedId,
  onChange,
  onNew,
  onClear,
  onSave,
  onDelete,
  onImageError
}: BirthdayFormProps) {
  function updateField(field: keyof BirthdayFormValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      updateField("photoDataUrl", await adaptPhotoToDataUrl(file));
    } catch (error) {
      onImageError(error instanceof Error ? error.message : "Nao foi possivel preparar a foto.");
    } finally {
      event.target.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-cloud p-4 text-center transition hover:border-brand">
          {values.photoDataUrl ? (
            <img src={values.photoDataUrl} alt="" className="h-48 w-36 rounded-md object-cover shadow-soft" />
          ) : (
            <>
              <ImagePlus aria-hidden="true" className="text-slate-500" size={32} />
              <span className="text-sm font-medium text-slate-600">Foto 3x4</span>
            </>
          )}
          <input className="sr-only" type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              className="h-11 rounded-md border border-line px-3"
              maxLength={20}
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Funcao</span>
            <input
              className="h-11 rounded-md border border-line px-3"
              value={values.role}
              onChange={(event) => updateField("role", event.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
            <input
              className="h-11 rounded-md border border-line px-3"
              inputMode="tel"
              placeholder="(11) 99999-9999"
              value={values.whatsapp}
              onChange={(event) => updateField("whatsapp", event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Data dd/mm</span>
            <input
              className="h-11 rounded-md border border-line px-3"
              inputMode="numeric"
              placeholder="12/05"
              value={values.birthday}
              onChange={(event) => updateField("birthday", event.target.value)}
              required
            />
          </label>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-700 hover:bg-cloud"
        >
          <Sparkles aria-hidden="true" size={17} />
          Novo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-700 hover:bg-cloud"
        >
          <X aria-hidden="true" size={17} />
          Limpar
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Save aria-hidden="true" size={17} />
          Salvar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!selectedId}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-cherry px-4 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 aria-hidden="true" size={17} />
          Deletar
        </button>
      </div>
    </form>
  );
}
