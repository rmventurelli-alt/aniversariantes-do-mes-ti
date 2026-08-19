import { AppHeader } from "@/components/AppHeader";
import { MainMenu } from "@/components/MainMenu";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-normal text-ink sm:text-4xl">Gerador de artes de aniversariantes</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Cadastre pessoas e templates para compor a arte mensal com blocos dinamicos e exportacao em PNG.
          </p>
        </div>
        <MainMenu />
      </section>
    </main>
  );
}
