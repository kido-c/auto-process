import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { useTodayWorkout } from "@/domains/workout/hooks/useTodayWorkout";
import { useExercises } from "@/domains/exercise/hooks/useExercises";
import { formatDisplayDate } from "@/utils/date";

export function HomePage() {
  const { date, workoutDay } = useTodayWorkout();
  const exercises = useExercises();
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const sessions = workoutDay?.sessions ?? [];

  return (
    <Layout title="운동 기록" showBack={false}>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 p-2 text-blue-600">🏋️</span>
        <div>
          <h2 className="text-lg font-semibold text-primary">운동 기록</h2>
          <p className="text-sm text-muted">오늘 할 운동을 선택하세요</p>
        </div>
      </div>

      <Card className="mb-4">
        <p className="mb-2 text-sm text-muted">{formatDisplayDate(date)}</p>
        {sessions.length === 0 ? (
          <p className="text-muted">오늘 기록된 운동이 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-sm text-primary">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link to={`/session/${s.id}`} className="flex items-center justify-between hover:underline">
                  <span>{exerciseMap.get(s.exerciseId)?.name ?? "(알 수 없음)"}</span>
                  <span className="text-muted">{s.sets.length}세트</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link
        to="/select"
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-white hover:opacity-90"
      >
        운동 추가
      </Link>

      <Link
        to="/log"
        className="mb-4 block w-full rounded-xl border border-gray-300 py-3 text-center text-sm font-medium text-primary hover:bg-gray-50"
      >
        운동 기록 보기
      </Link>

      <Link to="/settings" className="block text-center text-xs text-muted hover:text-primary">
        설정 (Obsidian 자동 기록)
      </Link>
    </Layout>
  );
}
