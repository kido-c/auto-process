import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { db } from "@/db";
import { useExercises } from "@/domains/exercise/hooks/useExercises";
import { completeWorkoutDay } from "@/domains/workout/hooks/useTodayWorkout";
import { workoutDayToMarkdown, downloadMarkdown } from "@/domains/export/obsidian";
import { sendWorkoutToObsidianServer, getObsidianServerConfig } from "@/utils/obsidianServer";
import { todayDateString } from "@/utils/date";

export function ExportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const date = dateParam ?? todayDateString();

  const exercises = useExercises();
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  const [day, setDay] = useState<import("@/db").WorkoutDay | null>(null);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [sendError, setSendError] = useState("");

  useLoadWorkoutDay(date, setDay);

  const markdown = day ? workoutDayToMarkdown(day, exerciseMap) : "";
  const { serverUrl, token } = getObsidianServerConfig();
  const hasServerConfig = Boolean(serverUrl && token);

  const handleCopy = useCallback(async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    alert("클립보드에 복사되었습니다. Obsidian에 붙여넣기 하세요.");
  }, [markdown]);

  const handleDownload = useCallback(() => {
    if (!markdown) return;
    downloadMarkdown(markdown, `workout-${date}.md`);
  }, [markdown, date]);

  const handleComplete = useCallback(async () => {
    await completeWorkoutDay(date);
    navigate("/", { replace: true });
  }, [date, navigate]);

  const handleSendToServer = useCallback(async () => {
    if (!markdown) return;
    setSendStatus("sending");
    setSendError("");
    const result = await sendWorkoutToObsidianServer(date, markdown);
    if (result.ok) {
      if ("skipped" in result && result.skipped) {
        setSendStatus("skipped");
        setSendError(result.message);
        setTimeout(() => {
          setSendStatus("idle");
          setSendError("");
        }, 4000);
      } else {
        setSendStatus("ok");
        setTimeout(() => setSendStatus("idle"), 3000);
      }
    } else {
      setSendStatus("error");
      const msg =
        result.error === "Not Found"
          ? "서버를 찾을 수 없습니다. 설정에서 서버 URL이 http://Mac의IP:31415 인지 확인하세요. (앱 주소 5173이 아니라 Obsidian 서버 31415입니다.)"
          : result.error;
      setSendError(msg);
    }
  }, [date, markdown]);

  if (!day && dateParam === null) {
    return (
      <Layout title="Obsidian 내보내기">
        <Card>
          <p className="text-muted">오늘 기록이 없습니다.</p>
          <button type="button" onClick={() => navigate("/")} className="mt-4 text-primary underline">
            홈으로
          </button>
        </Card>
      </Layout>
    );
  }

  if (!day) {
    return (
      <Layout title="Obsidian 내보내기">
        <p className="text-muted">로딩 중...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Obsidian에 기록하기">
      <Card className="mb-4">
        <p className="mb-4 text-sm text-muted">
          아래 내용을 복사해 Obsidian에 붙여넣거나, 파일로 저장하세요.
        </p>
        <pre className="max-h-64 overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-primary whitespace-pre-wrap">
          {markdown || "(내용 없음)"}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasServerConfig && (
            <button
              type="button"
              onClick={handleSendToServer}
              disabled={sendStatus === "sending"}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {sendStatus === "sending"
                ? "전송 중..."
                : sendStatus === "ok"
                  ? "기록 완료"
                  : sendStatus === "skipped"
                    ? "이미 기록됨"
                    : "Obsidian에 자동 기록"}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
          >
            복사
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
          >
            다운로드
          </button>
          {date === todayDateString() && (
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-50"
            >
              운동 완료
            </button>
          )}
        </div>
        {sendStatus === "error" && (
          <p className="mt-2 text-sm text-red-600">{sendError}</p>
        )}
        {sendStatus === "skipped" && sendError && (
          <p className="mt-2 text-sm text-amber-700">{sendError}</p>
        )}
        {hasServerConfig ? (
          <p className="mt-2 text-xs text-muted">
            <Link to="/settings" className="underline">설정</Link>에서 서버 URL과 토큰을 변경할 수 있습니다.
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            <Link to="/settings" className="underline">설정</Link>에서 로컬 서버 URL과 토큰을 입력하면 자동 기록을 사용할 수 있습니다.
          </p>
        )}
      </Card>
      <p className="text-center text-xs text-muted">
        Obsidian에서 Daily note나 원하는 노트에 붙여넣기 하시면 됩니다.
      </p>
    </Layout>
  );
}

function useLoadWorkoutDay(
  date: string,
  setDay: (d: import("@/db").WorkoutDay | null) => void
) {
  useEffect(() => {
    let cancelled = false;
    db.workoutDays.get(date).then((d) => {
      if (!cancelled) setDay(d ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);
}
