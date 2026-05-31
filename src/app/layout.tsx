import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Layout from "@/components/Layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AInsight - AI & Embedded News",
  description:
    "Daily AI and embedded systems industry news with Chinese summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
