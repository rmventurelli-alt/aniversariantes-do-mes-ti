"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ReportCanvas } from "@/components/ReportCanvas";
import { ReportGeneratorForm } from "@/components/ReportGeneratorForm";
import { getBirthdayPeople, getSelectedAssetId, getStoredAssets } from "@/lib/storage";
import type { Asset } from "@/types/asset";
import type { BirthdayPerson } from "@/types/birthday";
import type { ReportSelection } from "@/types/report";

export default function GeneratorPage() {
  const [people, setPeople] = useState<BirthdayPerson[]>([]);
  const [templates, setTemplates] = useState<Asset[]>([]);
  const [generated, setGenerated] = useState(false);
  const [selection, setSelection] = useState<ReportSelection>({
    month: new Date().getMonth() + 1,
    templateId: "",
    format: "a3-portrait",
    startPercent: 16,
    startXPercent: 5,
    showMonthName: true,
    monthNameXPercent: 50,
    monthNameYPercent: 8
  });

  useEffect(() => {
    async function loadData() {
      const [loadedTemplates, loadedPeople, selectedTemplateId] = await Promise.all([
        getStoredAssets("template"),
        getBirthdayPeople(),
        getSelectedAssetId("template")
      ]);

      setPeople(loadedPeople);
      setTemplates(loadedTemplates);
      setSelection((current) => ({
        ...current,
        templateId: selectedTemplateId || loadedTemplates[0]?.id || ""
      }));
    }

    loadData();
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selection.templateId),
    [selection.templateId, templates]
  );
  const monthPeople = useMemo(
    () =>
      people
        .filter((person) => person.birthdayMonth === selection.month)
        .sort((a, b) => a.birthdayDay - b.birthdayDay || a.name.localeCompare(b.name)),
    [people, selection.month]
  );

  function handleSelectionChange(nextSelection: ReportSelection) {
    setSelection((current) => {
      if (
        current.month !== nextSelection.month ||
        current.templateId !== nextSelection.templateId ||
        current.format !== nextSelection.format
      ) {
        setGenerated(false);
      }

      return nextSelection;
    });
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Gerador do Relatorio</h1>
          <p className="mt-2 text-sm text-slate-600">Selecione os itens, gere a arte e arraste os blocos dentro do canvas.</p>
        </div>
        <ReportGeneratorForm
          templates={templates}
          selection={selection}
          onChange={handleSelectionChange}
          onGenerate={() => setGenerated(true)}
        />
        <ReportCanvas
          month={selection.month}
          template={selectedTemplate}
          people={monthPeople}
          generated={generated}
          format={selection.format}
          startPercent={selection.startPercent}
          startXPercent={selection.startXPercent}
          showMonthName={selection.showMonthName}
          monthNameXPercent={selection.monthNameXPercent}
          monthNameYPercent={selection.monthNameYPercent}
        />
      </section>
    </main>
  );
}
