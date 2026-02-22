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

  const REQUEST_TIMEOUT_MS = 20000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ date, content: markdown }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    const isAbort = e instanceof Error && e.name === "AbortError";
    const msg = isAbort
      ? "요청 시간이 초과되었습니다. Tailscale이 연결되어 있는지, Mac에서 서버와 tailscale serve가 켜져 있는지 확인하세요."
      : e instanceof Error
        ? e.message
        : "네트워크 오류";
    return { ok: false, error: msg };
  }
}

/** 서버 연결 확인용 (GET). 인증 없이 200이면 서버 도달 가능. */
export async function checkObsidianServerReachable(): Promise<{ ok: boolean; error?: string }> {
  const { serverUrl } = getObsidianServerConfig();
  if (!serverUrl?.trim()) {
    return { ok: false, error: "서버 URL이 비어 있습니다." };
  }
  let base = serverUrl.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = "http://" + base;
  }
  const url = `${base}/`;
  try {
    const res = await fetch(url, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.ok === true) {
      return { ok: true };
    }
    return { ok: false, error: data?.error ?? res.statusText ?? `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "연결 실패";
    return { ok: false, error: msg };
  }
}
