import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { seedExercisesIfEmpty } from "@/db";
import { HomePage } from "@/pages/HomePage";
import { ExerciseSelectPage } from "@/pages/ExerciseSelectPage";
import { SessionPage } from "@/pages/SessionPage";
import { LogPage } from "@/pages/LogPage";
import { ExportPage } from "@/pages/ExportPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import "./index.css";

function NotFoundPage() {
  return (
    <Layout title="페이지 없음">
      <p className="text-muted">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        홈으로
      </Link>
    </Layout>
  );
}

export function App() {
  useEffect(() => {
    seedExercisesIfEmpty();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select" element={<ExerciseSelectPage />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/log/export" element={<ExportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
