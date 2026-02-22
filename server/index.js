/**
 * Obsidian 자동 기록 로컬 서버
 * - 토큰 검증, 데일리 노트에 추가 또는 Workouts 폴더에 저장
 * - 코드 실행 없음, 파일 쓰기만 수행
 *
 * 사용법 (데일리 노트에 기록):
 *   OBSIDIAN_DAILY_PATH="/path/to/01_Daily" OBSIDIAN_TOKEN=your-secret node server/index.js
 *
 * 사용법 (Workouts 폴더에 별도 파일):
 *   OBSIDIAN_VAULT_PATH=/path/to/vault OBSIDIAN_TOKEN=your-secret node server/index.js
 *
 * PORT=31415  (기본값 31415)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT) || 31415;
const DAILY_PATH = process.env.OBSIDIAN_DAILY_PATH;
const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;
const TOKEN = process.env.OBSIDIAN_TOKEN;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FILENAME_PATTERN = /^workout-\d{4}-\d{2}-\d{2}\.md$/;

if (!TOKEN) {
  console.error("필수 환경 변수: OBSIDIAN_TOKEN");
  process.exit(1);
}
if (!DAILY_PATH && !VAULT_PATH) {
  console.error("OBSIDIAN_DAILY_PATH 또는 OBSIDIAN_VAULT_PATH 중 하나를 설정하세요.");
  process.exit(1);
}

const dailyAbs = DAILY_PATH ? path.resolve(DAILY_PATH) : null;
const vaultAbs = VAULT_PATH ? path.resolve(VAULT_PATH) : null;
const subDir = "Workouts";

function getAuthToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function send(res, status, body, extraHeaders = {}) {
  const headers = { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS, ...extraHeaders };
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function extractExerciseBlock(content) {
  const lines = content.split("\n");
  const firstSectionIdx = lines.findIndex((l) => /^##\s/.test(l.trim()));
  if (firstSectionIdx < 0) return content;
  return lines.slice(firstSectionIdx).join("\n").trimEnd();
}

function getExerciseHeadings(block) {
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("## ") && !l.includes("🏋") && !l.includes("운동 기록"));
}

function sectionAlreadyHasWorkout(sectionContent, exerciseBlock) {
  const headings = getExerciseHeadings(exerciseBlock);
  if (headings.length === 0) return false;
  const firstHeading = headings[0];
  return sectionContent.includes(firstHeading);
}

function getPathname(req) {
  const u = req.url ?? "";
  const q = u.indexOf("?");
  return q >= 0 ? u.slice(0, q) : u;
}

const server = http.createServer(async (req, res) => {
  const pathname = getPathname(req);
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, { ...CORS_HEADERS, "Content-Length": "0" });
    res.end();
    return;
  }

  // 연결 확인용: GET / 또는 GET /workout → 200 + 메시지 (인증 불필요)
  if (req.method === "GET" && (pathname === "/" || pathname === "/workout")) {
    send(res, 200, { ok: true, message: "Obsidian workout server is running" });
    return;
  }

  if (req.method !== "POST" || pathname !== "/workout") {
    send(res, 404, { ok: false, error: "Not Found" });
    return;
  }

  if (getAuthToken(req) !== TOKEN) {
    send(res, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  let raw;
  try {
    raw = await parseBody(req);
  } catch {
    send(res, 400, { ok: false, error: "Bad Request" });
    return;
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    send(res, 400, { ok: false, error: "Invalid JSON" });
    return;
  }

  const { date, content } = body;
  if (typeof date !== "string" || typeof content !== "string") {
    send(res, 400, { ok: false, error: "date and content required" });
    return;
  }
  if (!DATE_PATTERN.test(date)) {
    send(res, 400, { ok: false, error: "Invalid date format (YYYY-MM-DD)" });
    return;
  }

  let resolvedFile;
  let toAppend = false;

  if (dailyAbs) {
    // 데일리 노트: 01_Daily/YYYY-MM-DD.md 에 오늘 날짜 파일로 추가
    const filePath = path.join(dailyAbs, `${date}.md`);
    resolvedFile = path.resolve(filePath);
    const resolvedDaily = path.resolve(dailyAbs);
    if (!resolvedFile.startsWith(resolvedDaily + path.sep) && resolvedFile !== resolvedDaily) {
      send(res, 400, { ok: false, error: "Path not allowed" });
      return;
    }
    toAppend = true;
  } else {
    const filename = `workout-${date}.md`;
    const dir = path.join(vaultAbs, subDir);
    const filePath = path.join(dir, filename);
    resolvedFile = path.resolve(filePath);
    const resolvedVault = path.resolve(vaultAbs);
    if (!resolvedFile.startsWith(resolvedVault + path.sep) && resolvedFile !== resolvedVault) {
      send(res, 400, { ok: false, error: "Path not allowed" });
      return;
    }
    try {
      fs.mkdirSync(path.dirname(resolvedFile), { recursive: true });
    } catch (e) {
      /* ignore */
    }
  }

  try {
    if (toAppend) {
      const existing = fs.existsSync(resolvedFile)
        ? fs.readFileSync(resolvedFile, "utf8")
        : "";
      const lines = existing.split("\n");
      const exerciseBlock = extractExerciseBlock(content);

      const headerIdx = lines.findIndex(
        (l) => l.trim().startsWith("## ") && (l.includes("🏋") || l.includes("운동"))
      );
      const ourHeadings = new Set(
        getExerciseHeadings(exerciseBlock).map((h) => h.trim())
      );
      let nextStart = lines.length;
      if (headerIdx >= 0) {
        for (let i = headerIdx + 1; i < lines.length; i++) {
          const t = lines[i].trim();
          if (t.startsWith("## ") && !ourHeadings.has(t)) {
            nextStart = i;
            break;
          }
        }
        const sectionContent = lines.slice(headerIdx, nextStart).join("\n");
        if (sectionAlreadyHasWorkout(sectionContent, exerciseBlock)) {
          send(res, 200, {
            ok: true,
            skipped: true,
            message: "이미 동일한 운동 기록이 있습니다.",
          });
          return;
        }
        lines.splice(nextStart, 0, "", ...exerciseBlock.split("\n"));
      } else {
        lines.push("", "## 🏋 운동", "", ...exerciseBlock.split("\n"));
      }
      fs.writeFileSync(resolvedFile, lines.join("\n"), "utf8");
    } else {
      fs.writeFileSync(resolvedFile, content, "utf8");
    }
    send(res, 200, { ok: true, path: resolvedFile });
  } catch (err) {
    console.error(err);
    send(res, 500, { ok: false, error: err.message || "Write failed" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Obsidian 기록 서버: http://0.0.0.0:${PORT}`);
  if (dailyAbs) {
    console.log(`데일리 노트 경로: ${dailyAbs}/YYYY-MM-DD.md (해당 날짜 파일에 추가)`);
  } else {
    console.log(`Vault 경로: ${vaultAbs}/${subDir}`);
  }
});
