import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Vishwajit Labs | Python Backend & AI Systems Engineer",
  description: "Engineering Portfolio of Vishwajit - Building high-performance backend platforms, distributed RAG/Agent frameworks, custom MCP servers, and developer tooling.",
  keywords: ["Python", "Backend Engineer", "AI Engineer", "FastAPI", "RAG", "MCP", "Docker", "System Designer"],
  authors: [{ name: "Vishwajit" }],
  openGraph: {
    title: "Vishwajit Labs | Python Backend & AI Systems Engineer",
    description: "Distributed RAG engines, telemetry SDKs, high-performance web ledger services, and developer tooling.",
    url: "https://vishwajitvm.dev",
    siteName: "Vishwajit Labs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishwajit Labs | Python Backend & AI Systems Engineer",
    description: "Scalable backends, AI Agents, custom MCP pipelines, and telemetry systems.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100 selection:bg-blue-500/30 selection:text-blue-200">
        <QueryProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
