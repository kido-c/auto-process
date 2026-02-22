import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { db } from "@/db";
import { useExercises } from "@/domains/exercise/hooks/useExercises";
import { useTodayWorkout, setWorkoutDayMemo } from "@/domains/workout/hooks/useTodayWorkout";
import { formatDisplayDate } from "@/utils/date";

export function LogPage() {
  const exercises = useExercises();
  const { date, workoutDay } = useTodayWorkout();
  const [memo, setMemo] = useState(workoutDay?.memo ?? "");

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const todaySessions = workoutDay?.sessions ?? [];
  const totalSets = todaySessions.reduce((acc, s) => acc + s.sets.length, 0);

  const handleMemoBlur = () => {
    if (date) setWorkoutDayMemo(date, memo);
  };

  return (
    <Layout title="운동 기록" showBack={true}>
      <Card className="mb-4 bg-blue-50/80">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <span>📅</span>
          <span className="font-medium">오늘의 운동</span>
          <span className="text-muted">—</span>
          <span className="text-sm text-muted">{formatDisplayDate(date)}</span>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-muted">운동 수</p>
            <p className="font-bold text-primary">{todaySessions.length}</p>
          </div>
          <div>
            <p className="text-muted">총 세트</p>
            <p className="font-bold text-primary">{totalSets}</p>
          </div>
          <div>
            <p className="text-muted">상태</p>
            <p className="font-bold text-primary">{workoutDay?.completedAt ? "완료" : "진행 중"}</p>
          </div>
        </div>
        <div className="mb-3">
          <p className="mb-1 text-sm text-muted">운동 내역:</p>
          <ul className="space-y-1 text-sm text-primary">
            {todaySessions.length === 0 ? (
              <li className="text-muted">아직 기록이 없습니다.</li>
            ) : (
              todaySessions.map((s, i) => {
                const ex = exerciseMap.get(s.exerciseId);
                const completed = s.sets.filter((set) => set.completedAt > 0).length;
                return (
                  <li key={s.id}>
                    {i + 1}. {ex?.name ?? "(알 수 없음)"} — {completed}/{s.sets.length} 세트
                  </li>
                );
              })
            )}
          </ul>
        </div>
        <div className="mb-3">
          <label className="block text-sm text-muted">운동 메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={handleMemoBlur}
            placeholder="오늘 운동에 대한 메모를 작성하세요..."
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-primary placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Link
            to="/log/export"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-medium text-white hover:opacity-90"
          >
            ✓ 운동 완료
          </Link>
          <Link
            to="/log/export"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
          >
            다운로드
          </Link>
          <Link
            to="/log/export"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
          >
            복사
          </Link>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-medium text-primary">이전 기록</h3>
        <PreviousRecords />
      </Card>
    </Layout>
  );
}

function PreviousRecords() {
  const days = useLiveQuery(() => db.workoutDays.toArray(), []);
  const list = (days ?? []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  return (
    <>
      <p className="mb-3 text-sm text-muted">총 {list.length}개의 운동 기록</p>
      <ul className="space-y-3">
        {list.map((day) => {
          const sessions = day.sessions;
          const setCount = sessions.reduce((a, s) => a + s.sets.length, 0);
          const totalKg = sessions.reduce((a, s) => {
            return a + s.sets.reduce((aa, set) => aa + (set.weight ?? 0) * (set.reps ?? 0), 0);
          }, 0);
          return (
            <li
              key={day.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-primary">{formatDisplayDate(day.date)}</p>
                <p className="text-muted">
                  {sessions.length}개 운동 · {setCount}세트 · {Math.round(totalKg)}kg
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={"/log/export?date=" + encodeURIComponent(day.date)}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-primary hover:bg-gray-50"
                >
                  다운로드
                </Link>
                <Link
                  to={"/log/export?date=" + encodeURIComponent(day.date)}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-primary hover:bg-gray-50"
                >
                  복사
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
