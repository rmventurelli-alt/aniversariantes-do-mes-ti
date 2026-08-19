import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aniversariantes do Mes",
  description: "Gerador de artes para aniversariantes do mes"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
