# KBO Live Now

Next.js 14, TypeScript, Tailwind CSS, App Router 기반 KBO 실시간 웹앱입니다.

## 기능

- 오늘 경기 일정
- 실시간 스코어보드
- 팀 순위
- 선수 타자/투수 기록
- 팀 타격/투수 기록
- 야구 뉴스 링크
- 경기 상세 확장용 placeholder

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

바탕화면의 `KBO Live Now Start.bat`을 더블클릭해도 로컬 무료 실행이 가능합니다.

## 무료 배포

Vercel 무료 플랜 배포를 기준으로 `vercel.json`과 `DEPLOYMENT.md`를 포함했습니다.

```bash
npm run build
```

빌드가 통과하면 GitHub 저장소에 올린 뒤 Vercel에서 Import 하면 됩니다.

## API

- `GET /api/kbo/schedule?date=YYYY-MM-DD`
- `GET /api/kbo/scoreboard`
- `GET /api/kbo/standings`
- `GET /api/kbo/player/hitters`
- `GET /api/kbo/player/pitchers`
- `GET /api/kbo/team/hitters`
- `GET /api/kbo/team/pitchers`
- `GET /api/news/baseball`

응답은 `{ "ok": true, "data": [...] }` 또는 `{ "ok": false, "message": "..." }` 형식을 유지합니다.

## 구조

- `services/`: 서버 전용 데이터 수집 계층
- `lib/parsers/`: KBO, 네이버 HTML 파서
- `lib/cache.ts`: TTL 메모리 캐시
- `lib/fetcher.ts`: 브라우저 User-Agent, Accept-Language, timeout을 포함한 HTML fetch 유틸
- `components/`: 서버 컴포넌트 중심 UI 구성

## 캐시 정책

- scoreboard: 30초
- schedule: 60초
- standings: 60초
- stats: 60초
- news: 120초

KBO 공식 사이트 HTML 구조가 변경될 수 있으므로 parser는 여러 테이블 selector 후보와 header fallback 전략을 사용합니다.
