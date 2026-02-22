# 운동 기록 PWA

운동 종류 선택 → 세트 기록(무게/반복, 휴식 타이머) → 하루 종료 시 Obsidian용 마크다운으로 복사/다운로드할 수 있는 PWA입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 가능합니다.

---

## iPhone에서 PWA 실행하는 방법

### 1. 같은 Wi‑Fi에서 Mac 개발 서버로 접속

1. **Mac**에서 터미널로 `npm run dev` 실행 (그대로 두기).
2. **iPhone**과 Mac이 **같은 Wi‑Fi**에 연결되어 있는지 확인.
3. Mac의 **IP 주소** 확인: 시스템 설정 → 네트워크 → Wi‑Fi → 상세 → TCP/IP 의 「IP 주소」.
4. **iPhone**에서 **Safari**를 열고 주소창에 입력:
   ```
   http://Mac의IP:5173
   ```
   예: `http://192.168.0.10:5173`
5. 페이지가 뜨면 **홈 화면에 추가**:
   - Safari 하단 **공유** 버튼(□ 위에 ↑) 탭
   - **홈 화면에 추가** 선택
   - 이름(예: 운동 기록) 확인 후 **추가**
6. 홈 화면에 생긴 **운동 기록** 아이콘을 탭하면 앱처럼 전체 화면으로 실행됩니다.

### 2. (선택) 인터넷에 배포한 경우

Vercel, Netlify, GitHub Pages 등에 `npm run build` 결과를 배포했다면, iPhone Safari에서 **배포된 URL**로 접속한 뒤, 위 5–6번처럼 **홈 화면에 추가**하면 됩니다.

### Obsidian 자동 기록을 쓸 때

iPhone에서 PWA를 쓰는 동안 **Mac에서 로컬 서버**(`npm run server:daily`)도 켜 두고, PWA **설정**에 서버 URL(`http://Mac의IP:31415`)과 토큰을 입력해 두면, **Obsidian에 자동 기록** 버튼으로 데일리 노트에 저장할 수 있습니다.

## 빌드 및 배포

```bash
npm run build
npm run preview   # dist 기준 로컬 미리보기
```

**프론트만 배포 (Vercel 예시)**: `npm run build` 후 생성된 `dist` 폴더를 [vercel.com](https://vercel.com)에서 새 프로젝트로 올리거나, GitHub 저장소를 연결한 뒤 빌드 명령 `npm run build`, 출력 디렉터리 `dist`로 설정하면 됩니다. 배포된 URL을 iPhone Safari에서 열고 홈 화면에 추가하면 어디서든 PWA로 사용할 수 있습니다.

## 기능

- **운동 종류 선택**: 기본 10종 + 직접 입력
- **세트 진행**: 무게(kg) / 반복(회) 입력, 세트 추가, 휴식 시작(설정 가능), 세트 완료, 이 운동 종료
- **운동 기록**: 오늘의 운동 요약, 메모, 이전 기록 목록
- **Obsidian 내보내기**: 복사, 다운로드(.md), **로컬 서버 자동 기록**, 운동 완료 처리

데이터는 브라우저 IndexedDB에만 저장되며, 오프라인에서도 동작합니다.

### Obsidian 자동 기록 (로컬 서버)

Mac에서 로컬 서버를 켜 두면, PWA에서 **Obsidian에 자동 기록** 버튼으로 vault에 바로 저장할 수 있습니다.

1. **서버 실행** (Mac 터미널, 프로젝트 폴더에서):
   - **데일리 노트에 기록** (이 프로젝트 기본 설정: SecondBrain 01_Daily):
     ```bash
     OBSIDIAN_TOKEN=비밀토큰 npm run server:daily
     ```
     또는 `./server/start.sh` (경로는 `server/start.sh` 안에 이미 설정됨). 토큰만 앞에 붙여서 실행하면 됩니다.
   - **다른 경로**로 데일리 노트를 쓰려면:
     ```bash
     OBSIDIAN_DAILY_PATH="/경로/to/01_Daily" OBSIDIAN_TOKEN=비밀토큰 npm run server
     ```
   - **Workouts 폴더에 별도 파일로 저장**:
     ```bash
     OBSIDIAN_VAULT_PATH="/경로/to/vault" OBSIDIAN_TOKEN=비밀토큰 npm run server
     ```
   - 기본 포트: 31415. 변경 시 `PORT=3000` 등으로 지정.
   - 같은 Wi‑Fi에서는 **서버 URL**에 Mac의 로컬 IP(192.168.x.x)를 쓰면 됩니다.

2. **PWA 설정**: 홈 → **설정 (Obsidian 자동 기록)** 에서
   - **서버 URL**: `http://Mac의IP:31415` (예: `http://192.168.0.10:31415`)
   - **토큰**: 위에서 설정한 `OBSIDIAN_TOKEN`과 동일하게 입력 후 저장.

3. **사용**: 운동 기록 → Obsidian에 기록하기 → **Obsidian에 자동 기록** 버튼을 누르면, 데일리 경로를 쓴 경우 해당 날짜 데일리 노트에 추가되고, vault 경로를 쓴 경우 `Workouts/workout-YYYY-MM-DD.md` 로 저장됩니다.

보안: 서버는 토큰이 맞을 때만 요청을 처리하며, 지정한 데일리 폴더 또는 vault 내 `Workouts/` 폴더에만 `YYYY-MM-DD.md` / `workout-YYYY-MM-DD.md` 형식으로 기록합니다.

---

### 외부에서도 기록하기 (Tailscale)

집·사무실 밖에서(다른 Wi‑Fi, LTE 등)에서도 자동 기록을 쓰려면 **Tailscale**을 쓰면 됩니다. (무료, 포트 포워딩·공유기 설정 불필요)

1. **Tailscale 가입 및 설치**
   - [tailscale.com](https://tailscale.com) 에서 가입 후, **Mac**과 **iPhone**에 Tailscale 앱을 설치하고 같은 계정으로 로그인합니다.
2. **Mac의 Tailscale IP 확인**
   - Mac에서 Tailscale 앱을 켜면 **Tailscale IP**(예: `100.101.102.103`)가 보입니다. (192.168.x.x가 아님)
3. **PWA 설정**
   - **서버 URL**을 `http://Mac의Tailscale_IP:31415` 로 넣고 저장합니다.  
     예: `http://100.101.102.103:31415`
4. **사용**
   - Mac에서 `npm run server:daily`(또는 `server/start.sh`)를 실행해 두고, iPhone은 **어디서든**(LTE, 다른 Wi‑Fi) PWA에서 **Obsidian에 자동 기록**을 누르면, Tailscale 경유로 Mac에 전달되어 데일리 노트에 기록됩니다.

**서버 URL을 Tailscale IP**(100.x.x.x)로 두면 **같은 Wi‑Fi에 있을 때와 외부(LTE·다른 Wi‑Fi)에 있을 때 모두** 사용할 수 있습니다. 한 번 Tailscale IP로 설정해 두면 별도 전환 없이 그대로 쓰시면 됩니다.

**외부에서 앱(PWA)을 여는 방법 — 두 가지**

- **방법 1: 프론트 배포 없이 (Mac으로 앱도 제공)**  
  Mac에서 `npm run dev`(5173)와 `npm run server:daily`(31415)를 둘 다 켜 두고, iPhone에서 Tailscale 연결된 상태로 **Safari에 `http://Mac의Tailscale_IP:5173`** 입력 후 홈 화면에 추가하면 됩니다.  
  단점: Mac이 켜져 있고 dev 서버가 돌아가 있어야만 앱에 접속할 수 있습니다.

- **방법 2: 프론트만 배포 (권장)**  
  `npm run build` 후 **Vercel / Netlify / GitHub Pages** 등에 `dist` 폴더를 배포해 두면, iPhone에서는 **배포된 URL**로만 앱에 접속하면 됩니다.  
  - 앱은 배포된 주소에서 항상 열 수 있고,  
  - **Obsidian 자동 기록**만 Mac(Tailscale IP:31415)으로 보내면 되므로, Mac은 “자동 기록할 때만” 켜 두면 됩니다.  
  - Tailscale IP는 위처럼 PWA 설정의 서버 URL에만 넣으면 됩니다.

정리하면, 외부에서도 “앱 열기 + 자동 기록”을 쓰려면 **Obsidian 서버(31415)는 Tailscale로 접속**하고, **앱(프론트)은 배포해 두면** Mac을 상시 켜두지 않아도 됩니다.

**방법 2 진행 절차 (Vercel)**  
1. 이 프로젝트를 GitHub 저장소에 올려 둡니다.  
2. [vercel.com](https://vercel.com) 로그인 후 **Add New → Project**에서 해당 저장소를 선택합니다.  
3. **Build Command** / **Output Directory**는 저장소 루트의 `vercel.json`에 이미 설정되어 있으므로 그대로 **Deploy** 합니다.  
4. 배포가 끝나면 **배포된 URL**(예: `https://workout-log-xxx.vercel.app`)이 나옵니다.  
5. iPhone Safari에서 이 URL을 열고 **공유 → 홈 화면에 추가**로 PWA로 설치합니다.  
6. 앱 내 **설정**에서 **서버 URL**을 `http://Mac의Tailscale_IP:31415` 로 저장하면, 자동 기록 시에만 Mac으로 요청이 갑니다.
