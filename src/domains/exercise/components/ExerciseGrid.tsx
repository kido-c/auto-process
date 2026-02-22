import type { Exercise } from "@/db";

interface ExerciseGridProps {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (exercise: Exercise) => void;
}

const ICONS: Record<string, string> = {
  벤치프레스: "🏋️",
  스쿼트: "📈",
  데드리프트: "📊",
  오버헤드프레스: "⬆️",
  바벨로우: "〰️",
  풀업: "⬆️",
  딥스: "⬇️",
  레그프레스: "🎯",
  레그컬: "〰️",
  레그익스텐션: "〰️",
};

export function ExerciseGrid({ exercises, selectedId, onSelect }: ExerciseGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {exercises.map((ex) => {
        const isSelected = selectedId === ex.id;
        const icon = ICONS[ex.name] ?? "💪";
        const bgColor = ex.iconColor ?? "#e5e7eb";

        return (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex)}
            className={`flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm transition-all ${
              isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:shadow"
            }`}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: bgColor + "40", color: bgColor }}
            >
              {icon}
            </span>
            <span className="text-center text-sm font-medium text-primary">{ex.name}</span>
          </button>
        );
      })}
    </div>
  );
}
