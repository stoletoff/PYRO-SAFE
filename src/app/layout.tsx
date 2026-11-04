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
  title: "PYRO-SAFE® FLAMMOTECT — Инженерный калькулятор огнезащиты | svt Products",
  description:
    "Профессиональный онлайн-калькулятор расчета расхода огнезащитных материалов PYRO-SAFE FLAMMOTECT-A, шпаклевки filler, минераловатных плит и проходок Double Layer (EI 120) по Регламенту 2022 года.",
  keywords: [
    "PYRO-SAFE",
    "FLAMMOTECT-A",
    "Double Layer",
    "EI 120",
    "огнезащита кабелей",
    "кабельные проходки",
    "закладные гильзы",
    "калькулятор огнезащиты",
    "пожарная безопасность",
    "СПЕЦЗАХИСТ",
    "svt Products",
  ],
  authors: [{ name: "svt Products / PYRO-SAFE" }],
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
