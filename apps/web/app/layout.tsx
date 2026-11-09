import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./v3.css";
import QueryProvider from "@/components/QueryProvider";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // Absolute base for the generated share image (app/opengraph-image.tsx) — link previews need a full URL.
  metadataBase: new URL("https://vishwajit-labs-web.vercel.app"),
  title: "Vishwajit VM — Backend & AI Engineer",
  description: "I build backends that don't break: APIs, databases, queues and AI agents. 5+ years, New Delhi, open to freelance and contract work.",
  keywords: ["Backend Engineer", "AI Engineer", "Python", "FastAPI", "NestJS", "PostgreSQL", "RAG", "MCP", "LangGraph", "Freelance"],
  authors: [{ name: "Vishwajit VM" }],
  openGraph: {
    title: "Vishwajit VM — Backend & AI Engineer",
    // LinkedIn wants 100+ characters here.
    description: "APIs, databases, queues and AI agents that keep working when things go wrong. Python, FastAPI, Node.js and NestJS. Open to freelance and contract work.",
    url: "https://vishwajit-labs-web.vercel.app",
    siteName: "Vishwajit Labs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishwajit VM — Backend & AI Engineer",
    description: "I build backends that don't break.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
