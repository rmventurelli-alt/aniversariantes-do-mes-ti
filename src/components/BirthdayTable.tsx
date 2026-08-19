import { useEffect, useMemo, useState } from "react";
import type { BirthdayPerson } from "@/types/birthday";
import { formatBirthday } from "@/lib/dateUtils";

const itemsPerPage = 10;
type SortKey = "name" | "role" | "whatsapp" | "birthday";
type SortDirection = "asc" | "desc";

type BirthdayTableProps = {
  people: BirthdayPerson[];
  selectedId: string;
  onSelect: (person: BirthdayPerson) => void;
};

export function BirthdayTable({ people, selectedId, onSelect }: BirthdayTableProps) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("birthday");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const matches = normalizedQuery
      ? people.filter((person) => person.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
      : people;

    return [...matches].sort((first, second) => {
      let result = 0;

      if (sortKey === "name") {
        result = first.name.localeCompare(second.name, "pt-BR");
      } else if (sortKey === "role") {
        result = first.role.localeCompare(second.role, "pt-BR");
      } else if (sortKey === "whatsapp") {
        result = first.whatsapp.localeCompare(second.whatsapp, "pt-BR");
      } else {
        result =
          first.birthdayMonth - second.birthdayMonth ||
          first.birthdayDay - second.birthdayDay ||
          first.name.localeCompare(second.name, "pt-BR");
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [people, query, sortDirection, sortKey]);
  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const visiblePeople = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPeople.slice(start, start + itemsPerPage);
  }, [currentPage, filteredPeople]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, sortDirection, sortKey]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  function sortLabel(key: SortKey) {
    if (sortKey !== key) {
      return "";
    }

    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
      <div className="border-b border-line p-4">
        <label className="grid max-w-md gap-2">
          <span className="text-sm font-medium text-slate-700">Filtrar por nome</span>
          <input
            className="h-10 rounded-md border border-line px-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite um nome"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="w-24 px-4 py-3 font-semibold">Foto 3x4</th>
              <th className="px-4 py-3 font-semibold">
                <button type="button" onClick={() => handleSort("name")} className="font-semibold hover:underline">
                  Nome{sortLabel("name")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">
                <button type="button" onClick={() => handleSort("role")} className="font-semibold hover:underline">
                  Funcao{sortLabel("role")}
                </button>
              </th>
              <th className="w-44 px-4 py-3 font-semibold">
                <button type="button" onClick={() => handleSort("whatsapp")} className="font-semibold hover:underline">
                  WhatsApp{sortLabel("whatsapp")}
                </button>
              </th>
              <th className="w-36 px-4 py-3 font-semibold">
                <button type="button" onClick={() => handleSort("birthday")} className="font-semibold hover:underline">
                  Aniversario{sortLabel("birthday")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {people.length === 0 ? "Nenhum aniversariante cadastrado." : "Nenhum aniversariante encontrado."}
                </td>
              </tr>
            ) : (
              visiblePeople.map((person) => (
                <tr
                  key={person.id}
                  className={`cursor-pointer border-t border-line transition hover:bg-cloud ${
                    selectedId === person.id ? "bg-teal-50" : "bg-white"
                  }`}
                  onClick={() => onSelect(person)}
                >
                  <td className="px-4 py-3">
                    {person.photoDataUrl ? (
                      <img
                        src={person.photoDataUrl}
                        alt={person.name}
                        className="h-16 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-16 w-12 rounded-md bg-slate-200" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{person.name}</td>
                  <td className="px-4 py-3 text-slate-600">{person.role}</td>
                  <td className="px-4 py-3 text-slate-600">{person.whatsapp || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatBirthday(person.birthdayDay, person.birthdayMonth)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Pagina {currentPage} de {totalPages} - {filteredPeople.length} de {people.length} aniversariante(s)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3 font-semibold text-slate-700 hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-45"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3 font-semibold text-slate-700 hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-45"
          >
            Proxima
          </button>
        </div>
      </div>
    </div>
  );
}
