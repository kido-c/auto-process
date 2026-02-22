import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutSession } from "@/db";
import { todayDateString } from "@/utils/date";

export function useTodayWorkout() {
  const date = todayDateString();
  const day = useLiveQuery(() => db.workoutDays.get(date).then((d) => d ?? null), [date]);
  return { date, workoutDay: day ?? null };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function getOrCreateTodayWorkout(): Promise<string> {
  const date = todayDateString();
  let day = await db.workoutDays.get(date);
  if (!day) {
    day = {
      id: date,
      date,
      sessions: [],
    };
    await db.workoutDays.add(day);
  }
  return date;
}

export async function addSessionToToday(exerciseId: string): Promise<string> {
  const date = await getOrCreateTodayWorkout();
  const day = await db.workoutDays.get(date);
  if (!day) throw new Error("Workout day not found");

  const sessionId = generateId();
  const session = {
    id: sessionId,
    exerciseId,
    sets: [],
    startedAt: Date.now(),
  };
  day.sessions.push(session);
  await db.workoutDays.put(day);
  return sessionId;
}

export async function updateSessionInToday(
  date: string,
  sessionId: string,
  update: (s: WorkoutSession) => void
) {
  const day = await db.workoutDays.get(date);
  if (!day) return;
  const idx = day.sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;
  update(day.sessions[idx]!);
  await db.workoutDays.put(day);
}

export async function endSession(date: string, sessionId: string) {
  await updateSessionInToday(date, sessionId, (s) => {
    s.endedAt = Date.now();
  });
}

export async function addSetToSession(date: string, sessionId: string, weight: number, reps: number) {
  await updateSessionInToday(date, sessionId, (s) => {
    s.sets.push({
      weight,
      reps,
      completedAt: Date.now(),
    });
  });
}

export async function completeSet(date: string, sessionId: string, setIndex: number) {
  await updateSessionInToday(date, sessionId, (s) => {
    const set = s.sets[setIndex];
    if (set) set.completedAt = Date.now();
  });
}

export async function setWorkoutDayMemo(date: string, memo: string) {
  const day = await db.workoutDays.get(date);
  if (!day) return;
  day.memo = memo;
  await db.workoutDays.put(day);
}

export async function completeWorkoutDay(date: string) {
  const day = await db.workoutDays.get(date);
  if (!day) return;
  day.completedAt = Date.now();
  await db.workoutDays.put(day);
}
