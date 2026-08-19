import Link from "next/link";
import { Images, ListChecks, MessageCircle, Wand2 } from "lucide-react";

const items = [
  {
    href: "/aniversariantes",
    label: "Lista de Aniversariantes",
    icon: ListChecks,
    description: "Cadastre, edite e organize as pessoas do mes."
  },
  {
    href: "/templates",
    label: "Upload de Template",
    icon: Images,
    description: "Cadastre fundos visuais para os relatorios."
  },
  {
    href: "/gerador",
    label: "Gerador do Relatorio",
    icon: Wand2,
    description: "Monte a arte, arraste os blocos e exporte PNG."
  },
  {
    href: "/whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    description: "Configure mensagens e execute envios de aniversario."
  }
];

export function MainMenu() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-32 items-start gap-4 rounded-md border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <Icon aria-hidden="true" size={22} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-ink">{item.label}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
