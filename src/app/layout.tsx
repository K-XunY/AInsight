import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
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
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
