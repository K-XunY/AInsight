"use client";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onChange }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChange(d.toISOString().split("T")[0]);
  };

  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d.toISOString().split("T")[0] <= today) {
      onChange(d.toISOString().split("T")[0]);
    }
  };

  const isToday = selectedDate === today;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={goBack}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="前一天"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <input
        type="date"
        value={selectedDate}
        max={today}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
      />

      <button
        onClick={goForward}
        disabled={isToday}
        className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30"
        aria-label="后一天"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="text-sm text-blue-600 hover:underline"
        >
          回到今天
        </button>
      )}
    </div>
  );
}
