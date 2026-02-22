import type { Exercise } from "@/db";

interface ExerciseGridProps {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseGrid({ exercises, selectedId, onSelect }: ExerciseGridProps) {
  const groups = groupBySubcategory(exercises);

  return (
    <div className="space-y-4">
      {groups.map(({ subcategory, items }) => (
        <div key={subcategory}>
          {subcategory && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {subcategory}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {items.map((ex) => {
              const isSelected = selectedId === ex.id;
              const bgColor = ex.iconColor ?? "#e5e7eb";

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onSelect(ex)}
                  className={`flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-left shadow-sm transition-all ${
                    isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:shadow"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: bgColor + "40", color: bgColor }}
                  >
                    💪
                  </span>
                  <span className="text-xs font-medium leading-tight text-primary">{ex.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupBySubcategory(exercises: Exercise[]): { subcategory: string; items: Exercise[] }[] {
  const map = new Map<string, Exercise[]>();

  for (const ex of exercises) {
    const key = ex.subcategory ?? "";
    const arr = map.get(key);
    if (arr) {
      arr.push(ex);
    } else {
      map.set(key, [ex]);
    }
  }

  return Array.from(map.entries()).map(([subcategory, items]) => ({ subcategory, items }));
}
