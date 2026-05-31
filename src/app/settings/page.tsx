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
          返回首页
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mt-2 mb-6">设置</h1>

        <p className="text-muted-foreground text-sm">暂无更多设置项</p>
      </div>
    </main>
  );
}
