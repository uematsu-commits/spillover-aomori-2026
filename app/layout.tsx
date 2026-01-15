import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { VocabularyProvider } from "@/contexts/VocabularyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "英語学習アプリ - 苦手な単語を文脈で覚える",
  description: "苦手な単語を文脈で覚える英語学習アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <VocabularyProvider>
          <Navigation />
          <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {children}
          </main>
        </VocabularyProvider>
      </body>
    </html>
  );
}

