import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PYRO-SAFE® — Инженерный калькулятор огнезащиты | svt Brandschutz",
  description:
    "Профессиональный онлайн-калькулятор расчета расхода огнезащитных материалов FLAMMOPLAST KS 1, мастики KS 3, лака SP-2 и кабельных проходок UNIVERSALSCHOTT по нормам EN 1366-3 и ДСТУ.",
  keywords: [
    "PYRO-SAFE",
    "svt Brandschutz",
    "FLAMMOPLAST KS 1",
    "UNIVERSALSCHOTT",
    "огнезащита кабелей",
    "кабельные проходки",
    "калькулятор огнезащиты",
    "EI 60",
    "EI 180",
    "пожарная безопасность",
  ],
  authors: [{ name: "svt Brandschutz / PYRO-SAFE" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
