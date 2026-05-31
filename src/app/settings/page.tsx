"use client";

import Link from "next/link";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; 返回首页
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-8">设置</h1>

        <Card>
          <CardHeader>
            <CardTitle>外观</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={theme}
              onValueChange={(value) => {
                if (value) setTheme(value as "light" | "dark" | "system");
              }}
            >
              <ToggleGroupItem value="light" aria-label="浅色模式">
                <Sun className="h-4 w-4 mr-1" />
                浅色
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="深色模式">
                <Moon className="h-4 w-4 mr-1" />
                深色
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="跟随系统">
                <Monitor className="h-4 w-4 mr-1" />
                系统
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
