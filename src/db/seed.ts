import { db } from "./schema";

const DEFAULT_EXERCISES = [
  { name: "벤치프레스", iconColor: "#93c5fd" },
  { name: "스쿼트", iconColor: "#c4b5fd" },
  { name: "데드리프트", iconColor: "#f9a8d4" },
  { name: "오버헤드프레스", iconColor: "#fdba74" },
  { name: "바벨로우", iconColor: "#67e8f9" },
  { name: "풀업", iconColor: "#86efac" },
  { name: "딥스", iconColor: "#a5b4fc" },
  { name: "레그프레스", iconColor: "#f472b6" },
  { name: "레그컬", iconColor: "#5eead4" },
  { name: "레그익스텐션", iconColor: "#fde047" },
] as const;

export async function seedExercisesIfEmpty(): Promise<void> {
  const count = await db.exercises.count();
  if (count > 0) return;

  const now = Date.now();
  await db.exercises.bulkAdd(
    DEFAULT_EXERCISES.map((e, i) => ({
      id: `seed-${i}`,
      name: e.name,
      type: "strength" as const,
      createdAt: now,
      iconColor: e.iconColor,
    }))
  );
}
