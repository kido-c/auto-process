import { Link, useLocation } from "react-router-dom";
import { OfflineBanner } from "./OfflineBanner";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
  showBack?: boolean;
}

export function Layout({ children, title, right, showBack = true }: LayoutProps) {
  const location = useLocation();
  const isLogPage = location.pathname === "/log";

  return (
    <div className="min-h-dvh bg-surface">
      <OfflineBanner />
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card px-4 py-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          {showBack && (
            <Link to="/" className="flex items-center gap-1 text-muted hover:text-primary" aria-label="뒤로">
              <span className="text-lg">←</span>
              <span>뒤로</span>
            </Link>
          )}
        </div>
        {title && <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-primary">{title}</h1>}
        <div className="ml-auto flex items-center gap-2">
          {right ??
            (isLogPage ? (
              <Link
                to="/log/export"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Obsidian에 기록하기
              </Link>
            ) : (
              <Link to="/" className="rounded p-2 text-muted hover:bg-surface hover:text-primary" aria-label="홈">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            ))}
        </div>
      </header>
      <main className="p-4 pb-8">{children}</main>
    </div>
  );
}
