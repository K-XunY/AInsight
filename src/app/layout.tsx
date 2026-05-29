import type { Metadata } from "next";
import Layout from "@/components/Layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AInsight - AI & Embedded News",
  description: "Daily AI and embedded systems industry news with Chinese summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
