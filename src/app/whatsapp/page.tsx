"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit3, ImagePlus, MessageCircle, Play, Save, Trash2, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { fileToDataUrl } from "@/lib/imageUpload";
import {
  deleteWhatsAppArtTemplate,
  deleteWhatsAppTemplate,
  getWhatsAppArtTemplates,
  getWhatsAppStatus,
  getWhatsAppTemplates,
  runWhatsAppBirthdaySend,
  saveWhatsAppArtTemplate,
  saveWhatsAppTemplate,
  updateWhatsAppArtTemplate,
  updateWhatsAppTemplate
} from "@/lib/storage";
import type {
  WhatsAppArtTemplate,
  WhatsAppBirthdayStatus,
  WhatsAppMessageTemplate,
  WhatsAppSendSummary
} from "@/types/whatsapp";

type MessageForm = {
  name: string;
  message: string;
  active: boolean;
};

type ArtForm = {
  name: string;
  imageDataUrl: string;
  active: boolean;
};

const emptyMessageForm: MessageForm = {
  name: "",
  message: "",
  active: false
};

const emptyArtForm: ArtForm = {
  name: "",
  imageDataUrl: "",
  active: false
};

function statusLabel(status: string) {
  if (status === "sent") {
    return "Enviado";
  }

  if (status === "failed") {
    return "Falhou";
  }

  if (status === "skipped") {
    return "Ignorado";
  }

  return "-";
}

export default function WhatsAppPage() {
  const [messageTemplates, setMessageTemplates] = useState<WhatsAppMessageTemplate[]>([]);
  const [artTemplates, setArtTemplates] = useState<WhatsAppArtTemplate[]>([]);
  const [activeMessageTemplate, setActiveMessageTemplate] = useState<WhatsAppMessageTemplate | null>(null);
  const [activeArtTemplate, setActiveArtTemplate] = useState<WhatsAppArtTemplate | null>(null);
  const [birthdays, setBirthdays] = useState<WhatsAppBirthdayStatus[]>([]);
  const [messageForm, setMessageForm] = useState<MessageForm>(emptyMessageForm);
  const [artForm, setArtForm] = useState<ArtForm>(emptyArtForm);
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editingArtId, setEditingArtId] = useState("");
  const [notice, setNotice] = useState("");
  const [running, setRunning] = useState(false);
  const [lastSummary, setLastSummary] = useState<WhatsAppSendSummary | null>(null);

  const sortedMessageTemplates = useMemo(
    () =>
      [...messageTemplates].sort(
        (a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "pt-BR")
      ),
    [messageTemplates]
  );
  const sortedArtTemplates = useMemo(
    () => [...artTemplates].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "pt-BR")),
    [artTemplates]
  );

  async function loadData() {
    const [nextMessageTemplates, nextArtTemplates, nextStatus] = await Promise.all([
      getWhatsAppTemplates(),
      getWhatsAppArtTemplates(),
      getWhatsAppStatus()
    ]);

    setMessageTemplates(nextMessageTemplates);
    setArtTemplates(nextArtTemplates);
    setActiveMessageTemplate(nextStatus.activeMessageTemplate);
    setActiveArtTemplate(nextStatus.activeArtTemplate);
    setBirthdays(nextStatus.birthdays);
  }

  useEffect(() => {
    loadData().catch(() => setNotice("Nao foi possivel carregar dados do WhatsApp."));
  }, []);

  function clearMessageForm() {
    setEditingMessageId("");
    setMessageForm(emptyMessageForm);
    setNotice("");
  }

  function clearArtForm() {
    setEditingArtId("");
    setArtForm(emptyArtForm);
    setNotice("");
  }

  async function handleArtFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageDataUrl = await fileToDataUrl(file);
    setArtForm((current) => ({ ...current, imageDataUrl }));
  }

  async function handleSaveArt() {
    try {
      if (editingArtId) {
        const updated = await updateWhatsAppArtTemplate({ id: editingArtId, ...artForm });
        setArtForm({ name: updated.name, imageDataUrl: updated.filePath, active: updated.active });
        setNotice("Template de arte atualizado.");
      } else {
        const saved = await saveWhatsAppArtTemplate(artForm);
        setEditingArtId(saved.id);
        setArtForm({ name: saved.name, imageDataUrl: saved.filePath, active: saved.active });
        setNotice("Template de arte cadastrado.");
      }

      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel salvar o template de arte.");
    }
  }

  async function handleSaveMessage() {
    try {
      if (editingMessageId) {
        const updated = await updateWhatsAppTemplate({ id: editingMessageId, ...messageForm });
        setMessageForm({ name: updated.name, message: updated.message, active: updated.active });
        setNotice("Mensagem atualizada.");
      } else {
        const saved = await saveWhatsAppTemplate(messageForm);
        setEditingMessageId(saved.id);
        setMessageForm({ name: saved.name, message: saved.message, active: saved.active });
        setNotice("Mensagem cadastrada.");
      }

      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel salvar a mensagem.");
    }
  }

  async function handleSetArtActive(template: WhatsAppArtTemplate) {
    try {
      await updateWhatsAppArtTemplate({ id: template.id, name: template.name, imageDataUrl: template.filePath, active: true });
      await loadData();
      setNotice("Template de arte ativo definido.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel definir o template de arte ativo.");
    }
  }

  async function handleSetMessageActive(template: WhatsAppMessageTemplate) {
    try {
      await updateWhatsAppTemplate({ id: template.id, name: template.name, message: template.message, active: true });
      await loadData();
      setNotice("Mensagem ativa definida.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel definir a mensagem ativa.");
    }
  }

  async function handleRun() {
    setRunning(true);
    setNotice("");

    try {
      const summary = await runWhatsAppBirthdaySend();
      setLastSummary(summary);
      await loadData();
      setNotice("Envio executado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel executar o envio.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">WhatsApp</h1>
          <p className="mt-2 text-sm text-slate-600">Arte individual, mensagem textual e execucao manual.</p>
        </div>

        {notice ? <div className="rounded-md bg-white p-3 text-sm font-medium text-brand shadow-soft">{notice}</div> : null}

        <section className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ImagePlus aria-hidden="true" size={20} className="text-brand" />
            <h2 className="text-lg font-semibold text-ink">Template de Arte WhatsApp</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-[260px_1fr]">
            <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-cloud p-4 transition hover:border-brand">
              {artForm.imageDataUrl ? (
                <img src={artForm.imageDataUrl} alt="" className="max-h-40 max-w-full rounded-md object-contain" />
              ) : (
                <>
                  <ImagePlus aria-hidden="true" size={32} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Upload da arte</span>
                </>
              )}
              <input className="sr-only" type="file" accept="image/*" onChange={handleArtFile} />
            </label>
            <div className="grid content-start gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Nome do template de arte</span>
                <input
                  className="h-11 rounded-md border border-line px-3"
                  value={artForm.name}
                  onChange={(event) => setArtForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={artForm.active}
                  onChange={(event) => setArtForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Ativo
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleSaveArt} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-teal-800">
                  <Save aria-hidden="true" size={17} />
                  Salvar arte
                </button>
                <button type="button" onClick={clearArtForm} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-700 hover:bg-cloud">
                  <X aria-hidden="true" size={17} />
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line p-4">
            <h2 className="text-lg font-semibold text-ink">Artes WhatsApp cadastradas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="w-32 px-4 py-3 font-semibold">Miniatura</th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="w-52 px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedArtTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhuma arte cadastrada.</td>
                  </tr>
                ) : (
                  sortedArtTemplates.map((template) => (
                    <tr key={template.id} className="border-t border-line">
                      <td className="px-4 py-3"><img src={template.filePath} alt={template.name} className="h-16 w-24 rounded-md object-contain" /></td>
                      <td className="px-4 py-3 font-medium text-ink">{template.name}</td>
                      <td className="px-4 py-3 text-slate-600">{template.active ? "Ativo" : "Inativo"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setEditingArtId(template.id); setArtForm({ name: template.name, imageDataUrl: template.filePath, active: template.active }); setNotice(""); }} className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-slate-700 hover:bg-cloud">
                            <Edit3 aria-hidden="true" size={14} /> Editar
                          </button>
                          <button type="button" onClick={() => handleSetArtActive(template)} disabled={template.active} className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-slate-700 hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-45">
                            <CheckCircle2 aria-hidden="true" size={14} /> Ativar
                          </button>
                          <button type="button" onClick={async () => { await deleteWhatsAppArtTemplate(template.id); await loadData(); setNotice("Template de arte excluido."); }} className="inline-flex h-9 items-center gap-1 rounded-md bg-cherry px-2 text-xs font-semibold text-white hover:bg-rose-800">
                            <Trash2 aria-hidden="true" size={14} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <MessageCircle aria-hidden="true" size={20} className="text-brand" />
            <h2 className="text-lg font-semibold text-ink">Mensagem WhatsApp</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Nome da mensagem</span>
              <input className="h-11 rounded-md border border-line px-3" value={messageForm.name} onChange={(event) => setMessageForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Texto enviado separado da imagem</span>
              <textarea className="min-h-28 rounded-md border border-line px-3 py-2" value={messageForm.message} onChange={(event) => setMessageForm((current) => ({ ...current, message: event.target.value }))} />
            </label>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={messageForm.active} onChange={(event) => setMessageForm((current) => ({ ...current, active: event.target.checked }))} />
            Ativa
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSaveMessage} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-teal-800">
              <Save aria-hidden="true" size={17} /> Salvar mensagem
            </button>
            <button type="button" onClick={clearMessageForm} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-slate-700 hover:bg-cloud">
              <X aria-hidden="true" size={17} /> Limpar
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
          <div className="border-b border-line p-4">
            <h2 className="text-lg font-semibold text-ink">Mensagens cadastradas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Mensagem</th>
                  <th className="w-52 px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedMessageTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhuma mensagem cadastrada.</td>
                  </tr>
                ) : (
                  sortedMessageTemplates.map((template) => (
                    <tr key={template.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ink">{template.name}</td>
                      <td className="px-4 py-3 text-slate-600">{template.active ? "Ativa" : "Inativa"}</td>
                      <td className="max-w-xl px-4 py-3 text-slate-600">{template.message}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setEditingMessageId(template.id); setMessageForm({ name: template.name, message: template.message, active: template.active }); setNotice(""); }} className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-slate-700 hover:bg-cloud">
                            <Edit3 aria-hidden="true" size={14} /> Editar
                          </button>
                          <button type="button" onClick={() => handleSetMessageActive(template)} disabled={template.active} className="inline-flex h-9 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-slate-700 hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-45">
                            <CheckCircle2 aria-hidden="true" size={14} /> Ativar
                          </button>
                          <button type="button" onClick={async () => { await deleteWhatsAppTemplate(template.id); await loadData(); setNotice("Mensagem excluida."); }} className="inline-flex h-9 items-center gap-1 rounded-md bg-cherry px-2 text-xs font-semibold text-white hover:bg-rose-800">
                            <Trash2 aria-hidden="true" size={14} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Envio de hoje</h2>
              <p className="text-sm text-slate-600">Arte ativa: {activeArtTemplate ? activeArtTemplate.name : "nenhuma"}</p>
              <p className="text-sm text-slate-600">Mensagem ativa: {activeMessageTemplate ? activeMessageTemplate.name : "nenhuma"}</p>
            </div>
            <button type="button" onClick={handleRun} disabled={running} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
              <Play aria-hidden="true" size={17} /> {running ? "Executando" : "Executar envio agora"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-cloud text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Ja enviado</th>
                  <th className="px-4 py-3 font-semibold">Ultimo status</th>
                  <th className="px-4 py-3 font-semibold">Erro</th>
                </tr>
              </thead>
              <tbody>
                {birthdays.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum aniversariante hoje.</td>
                  </tr>
                ) : (
                  birthdays.map((birthday) => (
                    <tr key={birthday.birthdayPersonId} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ink">{birthday.name}</td>
                      <td className="px-4 py-3 text-slate-600">{birthday.whatsapp || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{birthday.alreadySent ? "Sim" : "Nao"}</td>
                      <td className="px-4 py-3 text-slate-600">{statusLabel(birthday.lastStatus)}</td>
                      <td className="px-4 py-3 text-slate-600">{birthday.lastErrorMessage || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {lastSummary ? (
            <div className="rounded-md bg-cloud p-3 text-sm text-slate-700">
              Enviados: {lastSummary.sent} | Ignorados: {lastSummary.skipped} | Erros: {lastSummary.failed}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
