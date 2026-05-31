"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekdayName(d: Date): string {
  return "周" + WEEKDAY_NAMES[d.getDay()];
}

function getDateNumber(d: Date): string {
  return String(d.getDate());
}

export default function DateSelector({ selectedDate, onChange }: Props) {
  const today = new Date();
  const todayStr = formatDate(today);

  // Build a 30-day window: 29 days ago through today
  const days: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
      {days.map((d) => {
        const dateStr = formatDate(d);
        const isSelected = dateStr === selectedDate;
        const isTodayDate = dateStr === todayStr;

        return (
          <Button
            key={dateStr}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(dateStr)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg min-w-[3rem] px-2 py-1 h-auto",
              isSelected
                ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-[11px] leading-tight font-medium">
              {getWeekdayName(d)}
            </span>
            <span className="text-sm leading-tight font-semibold">
              {getDateNumber(d)}
            </span>
            {isTodayDate && !isSelected && (
              <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
