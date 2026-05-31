"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("deepseek_api_key") || "";
    const storedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setApiKey(storedKey);
    setTheme(storedTheme);
  }, []);

  const handleSave = () => {
    localStorage.setItem("deepseek_api_key", apiKey);
    localStorage.setItem("theme", theme);
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyTheme = (t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Apply theme on load
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

        {/* Theme */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主题
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              浅色
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              深色
            </button>
          </div>
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
