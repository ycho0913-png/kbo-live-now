# KBO Live Now

## 비공식 팬 서비스 및 출처 고지

KBO Live Now는 한국 프로야구 팬을 위한 비공식 팬 서비스입니다. KBO 공식 앱 또는 공식 서비스가 아닙니다.

- 경기 일정, 스코어, 순위, 선수 기록 등은 KBO 공식 사이트를 우선 참고합니다.
- 뉴스와 선수 소식은 네이버 스포츠, 다음 스포츠 및 각 언론사 원문 링크를 보조로 연결합니다.
- KBO, 네이버, 다음, 각 언론사의 출처를 표기합니다.
- 뉴스는 제목, 출처, 원문 링크만 유지하며 기사 본문, 기사 이미지, 영상, 하이라이트를 저장하지 않습니다.
- 영상 기록과 하이라이트는 직접 재생하거나 저장하지 않고 공식 링크만 연결합니다.
- 팀 로고 이미지 대신 이모지, 텍스트, 팀 대표 색상 중심의 표현을 사용합니다.
- 무료 공개는 가능하더라도 광고, 유료 결제, 판매 전에는 KBO 또는 데이터 제공사와 라이선스를 확인해야 합니다.

## 무료 배포 운영 메모

- 서버 캐시는 같은 데이터를 짧은 시간 안에 반복 호출하지 않도록 TTL과 동시 요청 합치기를 사용합니다.
- 외부 데이터 호출 실패 시 직전 캐시 데이터를 잠깐 재사용해 화면이 바로 깨지지 않도록 설계했습니다.
- 방문자가 크게 늘면 Vercel 무료 한도, KBO/뉴스 사이트 접근 정책, 데이터 라이선스를 다시 확인해야 합니다.

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
