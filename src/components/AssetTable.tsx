import type { Asset } from "@/types/asset";
import { Check, Edit3, Trash2 } from "lucide-react";

type AssetTableProps = {
  assets: Asset[];
  selectedId: string;
  onSelect: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void | Promise<void>;
};

export function AssetTable({ assets, selectedId, onSelect, onEdit, onDelete }: AssetTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="w-32 px-4 py-3 font-semibold">Miniatura</th>
              <th className="px-4 py-3 font-semibold">Nome cadastrado</th>
              <th className="w-64 px-4 py-3 font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  Nenhum arquivo cadastrado.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <img src={asset.imageDataUrl} alt={asset.name} className="h-16 w-24 rounded-md object-contain" />
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {asset.name}
                    {selectedId === asset.id ? (
                      <span className="ml-3 rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-brand">
                        Selecionado
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onSelect(asset)}
                        title="Selecionar"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-slate-700 hover:bg-cloud"
                      >
                        <Check aria-hidden="true" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(asset)}
                        title="Editar nome"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-slate-700 hover:bg-cloud"
                      >
                        <Edit3 aria-hidden="true" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(asset)}
                        title="Excluir"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-cherry text-white hover:bg-rose-800"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
