import Dexie from "dexie";

export type ExerciseType = "strength" | "cardio";

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  category?: string;
  subcategory?: string;
  createdAt: number;
  iconColor?: string;
}

export interface WorkoutSet {
  weight?: number;
  reps?: number;
  durationSeconds?: number;
  completedAt: number;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  startedAt: number;
  endedAt?: number;
}

export interface WorkoutDay {
  id: string;
  date: string; // YYYY-MM-DD
  sessions: WorkoutSession[];
  memo?: string;
  completedAt?: number;
}

class WorkoutDB extends Dexie {
  exercises!: Dexie.Table<Exercise, string>;
  workoutDays!: Dexie.Table<WorkoutDay, string>;

  constructor() {
    super("WorkoutLogDB");
    this.version(1).stores({
      exercises: "id, createdAt",
      workoutDays: "id, date",
    });
    this.version(2).stores({
      exercises: "id, createdAt, category",
      workoutDays: "id, date",
    });
  }
}

export const db = new WorkoutDB();
