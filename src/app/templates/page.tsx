"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AssetTable } from "@/components/AssetTable";
import { AssetUploadForm, emptyAssetForm, type AssetFormValues } from "@/components/AssetUploadForm";
import { createId, deleteStoredAsset, getSelectedAssetId, getStoredAssets, saveStoredAsset, setSelectedAssetId } from "@/lib/storage";
import type { Asset } from "@/types/asset";

export default function TemplatesPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState<AssetFormValues>(emptyAssetForm);
  const [editingId, setEditingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAssets() {
      try {
        setAssets(await getStoredAssets("template"));
        setSelectedId(await getSelectedAssetId("template"));
      } catch {
        setMessage("Nao foi possivel carregar os templates.");
      }
    }

    loadAssets();
  }, []);

  function clearForm() {
    setEditingId("");
    setForm(emptyAssetForm);
    setMessage("");
  }

  async function handleSubmit() {
    if (!form.imageDataUrl) {
      setMessage("Inclua o arquivo do template.");
      return;
    }

    try {
      if (editingId) {
        const currentAsset = assets.find((asset) => asset.id === editingId);

        if (!currentAsset) {
          setMessage("Template nao encontrado.");
          return;
        }

        const updatedAsset = await saveStoredAsset({ ...currentAsset, name: form.name.trim(), imageDataUrl: form.imageDataUrl });
        setAssets((current) => current.map((asset) => (asset.id === editingId ? updatedAsset : asset)));
        setForm({ name: updatedAsset.name, imageDataUrl: updatedAsset.imageDataUrl });
        setMessage("Template atualizado.");
        return;
      }

      const asset: Asset = {
        id: createId("template"),
        name: form.name.trim(),
        type: "template",
        imageDataUrl: form.imageDataUrl,
        createdAt: new Date().toISOString()
      };

      const savedAsset = await saveStoredAsset(asset);
      setAssets((current) => [...current, savedAsset]);
      setSelectedId(savedAsset.id);
      await setSelectedAssetId("template", savedAsset.id);
      setMessage("Template cadastrado.");
    } catch {
      setMessage("Nao foi possivel salvar o template. Tente um PNG menor ou remova templates antigos.");
    }
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Upload de Template</h1>
          <p className="mt-2 text-sm text-slate-600">O template sera usado como fundo visual da arte gerada.</p>
        </div>
        <AssetUploadForm
          title="Cadastro de template"
          values={form}
          editingId={editingId}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClear={clearForm}
        />
        <AssetTable
          assets={assets}
          selectedId={selectedId}
          onSelect={(asset) => {
            setSelectedId(asset.id);
            void setSelectedAssetId("template", asset.id);
          }}
          onEdit={(asset) => {
            setEditingId(asset.id);
            setForm({ name: asset.name, imageDataUrl: asset.imageDataUrl });
            setMessage("");
          }}
          onDelete={async (asset) => {
            try {
              await deleteStoredAsset(asset.id);
              setAssets((current) => current.filter((item) => item.id !== asset.id));
              if (selectedId === asset.id) {
                setSelectedId("");
                await setSelectedAssetId("template", "");
              }
              clearForm();
              setMessage("Template excluido.");
            } catch {
              setMessage("Nao foi possivel excluir o template.");
            }
          }}
        />
        {message ? <div className="rounded-md bg-white p-3 text-sm font-medium text-brand shadow-soft">{message}</div> : null}
      </section>
    </main>
  );
}
