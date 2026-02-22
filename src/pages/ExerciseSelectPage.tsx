import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { ExerciseGrid } from "@/domains/exercise/components/ExerciseGrid";
import { useExercises } from "@/domains/exercise/hooks/useExercises";
import { addSessionToToday } from "@/domains/workout/hooks/useTodayWorkout";
import { db } from "@/db";

export function ExerciseSelectPage() {
  const navigate = useNavigate();
  const exercises = useExercises();
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleStartWithExercise = async (exerciseId: string) => {
    const sessionId = await addSessionToToday(exerciseId);
    navigate(`/session/${sessionId}`, { replace: true });
  };

  const handleStartCustom = async () => {
    const name = customName.trim();
    if (!name) return;
    let ex = exercises.find((e) => e.name === name);
    if (!ex) {
      const id = "custom-" + Date.now();
      await db.exercises.add({
        id,
        name,
        type: "strength",
        createdAt: Date.now(),
      });
      ex = { id, name, type: "strength", createdAt: Date.now() };
    }
    setShowCustomInput(false);
    setCustomName("");
    await handleStartWithExercise(ex.id);
  };

  const handleSelectGridExercise = (ex: { id: string; name: string }) => {
    setSelected((prev) => (prev?.id === ex.id ? null : ex));
  };

  return (
    <Layout title="운동 기록" showBack={false}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 p-2 text-blue-600">🏋️</span>
        <div>
          <h2 className="text-lg font-semibold text-primary">운동 기록</h2>
          <p className="text-sm text-muted">오늘 할 운동을 선택하세요</p>
        </div>
      </div>

      <Card className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-muted">운동 종류 선택</h3>
        <ExerciseGrid
          exercises={exercises}
          selectedId={selected?.id ?? null}
          onSelect={(ex) => handleSelectGridExercise(ex)}
        />

        {selected && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => handleStartWithExercise(selected.id)}
              className="rounded-xl bg-primary px-6 py-2.5 font-medium text-white hover:opacity-90"
            >
              시작
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowCustomInput((v) => !v)}
            className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
          >
            + 직접 입력
          </button>

          {showCustomInput && (
            <div className="mt-3 flex flex-col gap-2">
              <label className="text-sm text-muted">운동 이름</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="예: 덤벨 컬"
                className="rounded-lg border border-gray-300 px-3 py-2 text-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStartCustom}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  시작
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-muted hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Link
        to="/log"
        className="block w-full rounded-xl border border-gray-300 py-3 text-center text-sm font-medium text-primary hover:bg-gray-50"
      >
        운동 기록 보기
      </Link>
    </Layout>
  );
}
