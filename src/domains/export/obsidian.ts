import type { WorkoutDay } from "@/db";
import type { Exercise } from "@/db";

export function workoutDayToMarkdown(day: WorkoutDay, exerciseMap: Map<string, Exercise>): string {
  const lines: string[] = [
    "---",
    `date: ${day.date}`,
    "type: workout",
    "---",
    "",
    `# 운동 기록 ${day.date}`,
    "",
  ];

  if (day.memo?.trim()) {
    lines.push(`메모: ${day.memo.trim()}`, "", "");
  }

  for (const session of day.sessions) {
    const ex = exerciseMap.get(session.exerciseId);
    const name = ex?.name ?? "(알 수 없음)";
    lines.push(`## ${name}`, "");

    if (session.sets.length === 0) {
      lines.push("*기록된 세트 없음*", "", "");
      continue;
    }

    const hasWeight = session.sets.some((s) => s.weight != null);
    const hasReps = session.sets.some((s) => s.reps != null);
    if (hasWeight || hasReps) {
      lines.push("| 세트 | 무게(kg) | 횟수 |", "|------|----------|------|");
      session.sets.forEach((set, i) => {
        const w = set.weight ?? "-";
        const r = set.reps ?? "-";
        lines.push(`| ${i + 1} | ${w} | ${r} |`);
      });
    } else {
      session.sets.forEach((set, i) => {
        const parts: string[] = [];
        if (set.durationSeconds != null) parts.push(`${set.durationSeconds}초`);
        lines.push(`- 세트 ${i + 1}: ${parts.join(" ") || "-"}`);
      });
    }
    lines.push("", "");
  }

  return lines.join("\n").trimEnd();
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
