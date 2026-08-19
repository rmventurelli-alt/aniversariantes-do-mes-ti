"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BirthdayForm, emptyBirthdayForm, type BirthdayFormValues } from "@/components/BirthdayForm";
import { BirthdayTable } from "@/components/BirthdayTable";
import { formatBirthday, parseBirthday } from "@/lib/dateUtils";
import {
  createBirthdayPerson,
  createId,
  deleteBirthdayPerson,
  getBirthdayPeople,
  updateBirthdayPerson
} from "@/lib/storage";
import type { BirthdayPerson } from "@/types/birthday";

function toFormValues(person: BirthdayPerson): BirthdayFormValues {
  return {
    photoDataUrl: person.photoDataUrl,
    name: person.name,
    role: person.role,
    whatsapp: person.whatsapp,
    birthday: formatBirthday(person.birthdayDay, person.birthdayMonth)
  };
}

export default function BirthdayPage() {
  const [people, setPeople] = useState<BirthdayPerson[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<BirthdayFormValues>(emptyBirthdayForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPeople() {
      try {
        setPeople(await getBirthdayPeople());
      } catch {
        setMessage("Nao foi possivel carregar os aniversariantes.");
      }
    }

    loadPeople();
  }, []);

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => a.birthdayMonth - b.birthdayMonth || a.birthdayDay - b.birthdayDay),
    [people]
  );

  function handleNew() {
    setSelectedId("");
    setForm(emptyBirthdayForm);
    setMessage("");
  }

  function handleClear() {
    setForm(emptyBirthdayForm);
    setMessage("");
  }

  async function handleSave() {
    const parsed = parseBirthday(form.birthday);

    if (!parsed) {
      setMessage("Informe a data no formato dd/mm.");
      return;
    }

    if (!form.photoDataUrl) {
      setMessage("Inclua uma foto 3x4.");
      return;
    }

    if (form.name.trim().length > 20) {
      setMessage("Nome deve ter no maximo 20 caracteres.");
      return;
    }

    if (selectedId) {
      try {
        const updatedPerson = await updateBirthdayPerson({
          id: selectedId,
          photoDataUrl: form.photoDataUrl,
          name: form.name.trim(),
          role: form.role.trim(),
          whatsapp: form.whatsapp.trim(),
          birthday: form.birthday
        });

        setPeople((current) => current.map((person) => (person.id === selectedId ? updatedPerson : person)));
        setForm(toFormValues(updatedPerson));
        setMessage("Aniversariante atualizado.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Nao foi possivel atualizar o aniversariante.");
      }
      return;
    }

    const nextPersonInput = {
      id: createId("birthday"),
      photoDataUrl: form.photoDataUrl,
      name: form.name.trim(),
      role: form.role.trim(),
      whatsapp: form.whatsapp.trim(),
      birthday: form.birthday
    };

    try {
      const nextPerson = await createBirthdayPerson(nextPersonInput);
      setPeople((current) => [...current, nextPerson]);
      setSelectedId(nextPerson.id);
      setForm(toFormValues(nextPerson));
      setMessage("Aniversariante cadastrado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel cadastrar o aniversariante.");
    }
  }

  async function handleDelete() {
    if (!selectedId) {
      return;
    }

    try {
      await deleteBirthdayPerson(selectedId);
      setPeople((current) => current.filter((person) => person.id !== selectedId));
      setSelectedId("");
      setForm(emptyBirthdayForm);
      setMessage("Aniversariante deletado.");
    } catch {
      setMessage("Nao foi possivel deletar o aniversariante.");
    }
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Lista de Aniversariantes</h1>
          <p className="mt-2 text-sm text-slate-600">Cadastre ou edite uma pessoa e consulte a lista paginada abaixo.</p>
        </div>
        <BirthdayForm
          values={form}
          selectedId={selectedId}
          onChange={setForm}
          onNew={handleNew}
          onClear={handleClear}
          onSave={handleSave}
          onDelete={handleDelete}
          onImageError={setMessage}
        />
        {message ? <div className="rounded-md bg-white p-3 text-sm font-medium text-brand shadow-soft">{message}</div> : null}
        <BirthdayTable
          people={sortedPeople}
          selectedId={selectedId}
          onSelect={(person) => {
            setSelectedId(person.id);
            setForm(toFormValues(person));
            setMessage("");
          }}
        />
      </section>
    </main>
  );
}
