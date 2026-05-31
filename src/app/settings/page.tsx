"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("deepseek_api_key") || "";
    setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("deepseek_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; 返回首页
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-8">设置</h1>

        {/* API Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DeepSeek API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            存储在本地浏览器，用于未来客户端功能
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          {saved ? "已保存 ✓" : "保存设置"}
        </button>
      </div>
    </main>
  );
}
