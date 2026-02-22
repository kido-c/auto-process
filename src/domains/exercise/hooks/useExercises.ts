import { useLiveQuery } from "dexie-react-hooks";
import { db, type Exercise } from "@/db";

export function useExercises(): Exercise[] {
  const list = useLiveQuery(() => db.exercises.orderBy("createdAt").toArray(), []);
  return list ?? [];
}
