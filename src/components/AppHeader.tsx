"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CakeSlice, Home } from "lucide-react";

const links = [
  { href: "/aniversariantes", label: "Aniversariantes" },
  { href: "/templates", label: "Templates" },
  { href: "/gerador", label: "Gerador" },
  { href: "/whatsapp", label: "WhatsApp" }
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3 text-ink">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white">
              <CakeSlice aria-hidden="true" size={22} />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-tight">Aniversariantes do Mes</span>
              <span className="block text-sm text-slate-500">Artes mensais de aniversariantes</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-slate-700 transition hover:bg-cloud"
          >
            <Home aria-hidden="true" size={17} />
            Inicio
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-ink text-white" : "text-slate-600 hover:bg-cloud hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
