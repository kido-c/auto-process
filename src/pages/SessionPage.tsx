import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { useExercises } from "@/domains/exercise/hooks/useExercises";
import {
  useTodayWorkout,
  addSetToSession,
  endSession,
  updateSessionInToday,
} from "@/domains/workout/hooks/useTodayWorkout";
import { formatTimer } from "@/utils/date";

const REST_STORAGE_KEY = "workout-rest-seconds";
const REST_OPTIONS = [30, 60, 90, 120] as const;

function getStoredRestSeconds(): number {
  try {
    const v = localStorage.getItem(REST_STORAGE_KEY);
    if (v != null) {
      const n = parseInt(v, 10);
      if (REST_OPTIONS.includes(n as (typeof REST_OPTIONS)[number])) return n;
    }
  } catch {
    /* ignore */
  }
  return 60;
}

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const exercises = useExercises();
  const { date, workoutDay } = useTodayWorkout();

  const [weight, setWeight] = useState(1);
  const [reps, setReps] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restRemain, setRestRemain] = useState(0);
  const [restSeconds, setRestSeconds] = useState(getStoredRestSeconds);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);

  const session = workoutDay?.sessions.find((s) => s.id === sessionId);
  const exercise = session ? exercises.find((e) => e.id === session.exerciseId) : null;
  const name = exercise?.name ?? "운동";

  useEffect(() => {
    if (timerStartedAt == null) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - timerStartedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [timerStartedAt]);

  useEffect(() => {
    if (!isResting || restRemain <= 0) return;
    const t = setInterval(() => {
      setRestRemain((r) => {
        if (r <= 1) {
          setIsResting(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isResting, restRemain]);

  const handleAddSet = async () => {
    if (!sessionId || !date) return;
    await addSetToSession(date, sessionId, weight, reps);
  };

  const handleStartRest = () => {
    setRestRemain(restSeconds);
    setIsResting(true);
  };

  const handleSetRestSeconds = (seconds: number) => {
    setRestSeconds(seconds);
    try {
      localStorage.setItem(REST_STORAGE_KEY, String(seconds));
    } catch {
      /* ignore */
    }
  };

  const handleCancelRest = () => {
    setIsResting(false);
    setRestRemain(0);
  };

  const handleEndExercise = async () => {
    if (!sessionId || !date) return;
    await endSession(date, sessionId);
    navigate("/", { replace: true });
  };

  if (!session || !workoutDay) {
    return (
      <Layout>
        <p className="text-muted">세션을 찾을 수 없습니다.</p>
        <button type="button" onClick={() => navigate("/")} className="mt-4 text-primary underline">
          홈으로
        </button>
      </Layout>
    );
  }

  const completedCount = session.sets.filter((s) => s.completedAt > 0).length;
  const totalSets = session.sets.length;

  return (
    <Layout title={name} showBack={true}>
      <Card className="mb-4">
        <h2 className="mb-3 text-lg font-bold text-primary">{name}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted">세트 수</p>
            <p className="text-2xl font-bold text-primary">{totalSets}</p>
          </div>
          <div>
            <p className="text-sm text-muted">완료된 세트</p>
            <p className="text-2xl font-bold text-primary">{completedCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted">타이머</p>
            <p className="text-2xl font-bold text-primary">
              {isResting ? formatTimer(restRemain) : formatTimer(elapsed)}
            </p>
            {!isResting && timerStartedAt == null && (
              <button
                type="button"
                onClick={() => setTimerStartedAt(Date.now())}
                className="mt-1 text-xs font-medium text-muted underline hover:text-primary"
              >
                타이머 시작
              </button>
            )}
            {isResting && (
              <button
                type="button"
                onClick={handleCancelRest}
                className="mt-1 text-xs font-medium text-muted underline hover:text-primary"
              >
                휴식 취소
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <h3 className="mb-2 text-sm font-medium text-muted">세트 입력</h3>
          <div className="mb-3">
            <p className="mb-1.5 text-xs text-muted">휴식 시간</p>
            <div className="flex gap-2">
              {REST_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={isResting}
                  onClick={() => handleSetRestSeconds(sec)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    restSeconds === sec
                      ? "bg-primary text-white"
                      : "border border-gray-300 bg-white text-primary hover:bg-gray-50 disabled:opacity-50"
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted">무게 (kg)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted">반복 (회)</label>
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value) || 1)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-primary"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAddSet}
              disabled={isResting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <span>+</span> 세트 추가
            </button>
            <button
              type="button"
              onClick={handleStartRest}
              disabled={isResting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-primary hover:bg-gray-50 disabled:opacity-50"
            >
              ⏸ 휴식 시작
            </button>
          </div>
        </div>

        {session.sets.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-sm font-medium text-muted">세트 기록</h3>
            <ul className="space-y-2">
              {session.sets.map((set, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="text-primary">
                    세트 {i + 1} — {set.weight ?? "-"}kg × {set.reps ?? "-"}회
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!sessionId || !date) return;
                      await updateSessionInToday(date, sessionId, (s) => {
                        const set = s.sets[i];
                        if (set) set.completedAt = Date.now();
                      });
                    }}
                    className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    ✓ 완료
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={handleEndExercise}
          className="mt-4 w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-muted hover:bg-gray-50"
        >
          이 운동 종료
        </button>
      </Card>
    </Layout>
  );
}
