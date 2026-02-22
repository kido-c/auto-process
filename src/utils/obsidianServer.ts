const STORAGE_URL = "workout-obsidian-server-url";
const STORAGE_TOKEN = "workout-obsidian-token";

export interface ObsidianServerConfig {
  serverUrl: string;
  token: string;
}

export function getObsidianServerConfig(): ObsidianServerConfig {
  try {
    const url = localStorage.getItem(STORAGE_URL) ?? "";
    const token = localStorage.getItem(STORAGE_TOKEN) ?? "";
    return { serverUrl: url.trim(), token: token.trim() };
  } catch {
    return { serverUrl: "", token: "" };
  }
}

export function setObsidianServerConfig(config: ObsidianServerConfig): void {
  localStorage.setItem(STORAGE_URL, config.serverUrl);
  localStorage.setItem(STORAGE_TOKEN, config.token);
}

export type SendResult =
  | { ok: true }
  | { ok: true; skipped: true; message: string }
  | { ok: false; error: string };

export async function sendWorkoutToObsidianServer(
  date: string,
  markdown: string
): Promise<SendResult> {
  const { serverUrl, token } = getObsidianServerConfig();
  if (!serverUrl || !token) {
    return { ok: false, error: "서버 URL과 토큰을 설정해 주세요." };
  }

  let base = serverUrl.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = "http://" + base;
  }
  const url = `${base}/workout`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, content: markdown }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.error ?? res.statusText ?? "요청 실패";
      return { ok: false, error: msg };
    }
    if (data.skipped === true && data.message) {
      return { ok: true, skipped: true, message: data.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "네트워크 오류";
    return { ok: false, error: msg };
  }
}
