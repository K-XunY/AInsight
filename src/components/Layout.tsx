import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-gray-900">
            AInsight
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            设置
          </Link>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
