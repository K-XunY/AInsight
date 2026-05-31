"use client";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function DateSelector({ selectedDate, onChange }: Props) {
  const selected = parseDate(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const display = selected.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-lg">
          <CalendarIcon size={14} />
          <span>{display}</span>
          {selectedDate === formatDate(today) && (
            <span className="text-xs text-primary font-medium">Today</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) onChange(formatDate(day));
          }}
          disabled={(day) => day > today}
        />
      </PopoverContent>
    </Popover>
  );
}
