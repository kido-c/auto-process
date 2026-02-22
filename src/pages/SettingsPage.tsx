import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { getObsidianServerConfig, setObsidianServerConfig } from "@/utils/obsidianServer";

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function SettingsPage() {
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getObsidianServerConfig();
    setServerUrl(c.serverUrl);
    setToken(c.token);
  }, []);

  const handleSave = () => {
    setObsidianServerConfig({ serverUrl: serverUrl.trim(), token: token.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerateToken = () => {
    const newToken = generateToken();
    setToken(newToken);
    try {
      navigator.clipboard.writeText(newToken);
    } catch {
      /* ignore */
    }
  };

  return (
    <Layout title="설정" showBack={true}>
      <Card className="mb-4">
        <h2 className="mb-2 text-base font-semibold text-primary">Obsidian 자동 기록</h2>
        <p className="mb-4 text-sm text-muted">
          Mac에서 로컬 서버를 실행한 뒤, 같은 Wi‑Fi에서 접속 가능한 주소와 토큰을 입력하세요.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted">서버 URL</label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="192.168.0.10:31415 또는 http://192.168.0.10:31415"
              title="http:// 는 없어도 자동으로 붙습니다. 포트 31415 사용."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-primary placeholder:text-gray-400"
            />
            <p className="mt-1 text-xs text-muted">
              <strong>서버 URL 아는 법:</strong> Obsidian 서버는 포트 <strong>31415</strong>입니다. (앱 주소 5173과 다릅니다.) Mac에서 <strong>시스템 설정 → 네트워크 → Wi‑Fi → 상세(또는 고급) → TCP/IP</strong> 에서 「IP 주소」를 확인하세요. URL은 <code className="rounded bg-gray-100 px-1">http://그IP:31415</code> 로 입력합니다. 터미널로 보려면 <code className="rounded bg-gray-100 px-1">ifconfig | grep " inet "</code> 입력 후 <code className="rounded bg-gray-100 px-1">127.0.0.1</code> 이 아닌 숫자(예: 192.168.x.x)를 쓰면 됩니다.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">토큰</label>
            <div className="mt-1 flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="서버 실행 시 쓴 것과 동일한 값"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-primary placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleGenerateToken}
                className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-primary hover:bg-gray-50"
              >
                토큰 생성
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              <strong>토큰이란?</strong> 본인이 정하는 비밀문자입니다. Mac에서 서버를 실행할 때 <code className="rounded bg-gray-100 px-1">OBSIDIAN_TOKEN=여기에적을값</code> 으로 넣고, 이 설정의 토큰 칸에도 <strong>같은 값</strong>을 입력하면 됩니다. 「토큰 생성」을 누르면 랜덤 값이 만들어지고 복사되므로, 그 값을 서버 실행 시와 여기 둘 다 넣으면 됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            {saved ? "저장됨" : "저장"}
          </button>
        </div>
      </Card>
      <Card className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-primary">로컬 서버 실행 방법</h3>
        <p className="mb-2 text-xs text-muted">Mac 터미널에서 (프로젝트 폴더로 이동한 뒤):</p>
        <p className="mb-1 text-xs text-muted">데일리 노트에 기록 (오늘 날짜 파일에 추가):</p>
        <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-primary">
          {`OBSIDIAN_DAILY_PATH="/경로/to/01_Daily" \\
OBSIDIAN_TOKEN=위에서_설정한_토큰과_동일 \\
npm run server`}
        </pre>
        <p className="mt-2 text-xs text-muted">
          예: <code className="rounded bg-gray-100 px-1">.../SecondBrain/01_Daily</code> 처럼 데일리 노트 폴더 경로를 넣으면, 해당 날짜의 <code className="rounded bg-gray-100 px-1">YYYY-MM-DD.md</code> 파일에 「## 🏋 운동」 섹션 아래에 추가됩니다.
        </p>
      </Card>
      <Card className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-primary">외부에서도 기록하려면 (Tailscale)</h3>
        <p className="mb-2 text-xs text-muted">
          다른 Wi‑Fi나 LTE에서도 기록하려면 <strong>Tailscale</strong>을 쓰세요. (무료, 포트 포워딩 없음)
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-muted">
          <li>tailscale.com 가입 후 Mac·iPhone에 Tailscale 앱 설치, 같은 계정 로그인</li>
          <li>Mac Tailscale 앱에서 표시되는 <strong>Tailscale IP</strong>(100.x.x.x) 확인</li>
          <li>위 서버 URL에 <code className="rounded bg-gray-100 px-1">http://100.x.x.x:31415</code> 형태로 입력 후 저장</li>
        </ol>
        <p className="mt-2 text-xs text-muted">
          서버 URL을 Tailscale IP(100.x.x.x)로 두면 같은 Wi‑Fi·외부 모두에서 사용 가능합니다. Mac에서 서버를 켜 두면 iPhone이 어디에 있든 자동 기록됩니다.
        </p>
      </Card>
      <Card className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-primary">(선택) Workouts 폴더에 별도 파일로 저장</h3>
        <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-primary">
          {`OBSIDIAN_VAULT_PATH="/경로/to/vault" \\
OBSIDIAN_TOKEN=위에서_설정한_토큰과_동일 \\
npm run server`}
        </pre>
        <p className="mt-2 text-xs text-muted">
          vault/Workouts/workout-YYYY-MM-DD.md 로 저장됩니다.
        </p>
      </Card>
    </Layout>
  );
}
