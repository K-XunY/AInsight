import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mt-2 mb-6">Settings</h1>

        <p className="text-muted-foreground text-sm">No settings available</p>
      </div>
    </main>
  );
}
