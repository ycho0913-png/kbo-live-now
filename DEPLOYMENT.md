# 무료 배포 가이드

이 프로젝트는 Next.js 14 App Router 기반이라 Vercel 무료 플랜에 가장 쉽게 배포할 수 있습니다.

## Vercel 무료 배포

1. GitHub에 `kbo-live-now` 저장소를 만듭니다.
2. 이 프로젝트 폴더를 GitHub 저장소에 push합니다.
3. Vercel에 로그인합니다.
4. `New Project`에서 GitHub 저장소를 선택합니다.
5. Framework Preset은 `Next.js`로 둡니다.
6. Build Command는 `npm run build`로 둡니다.
7. Deploy를 누릅니다.

환경변수는 현재 필요하지 않습니다.

## 로컬 무료 실행

바탕화면의 `KBO Live Now Start.bat` 파일을 더블클릭하면 개발 서버를 켜고 브라우저를 엽니다.

## 참고

KBO, 네이버, 다음 같은 외부 HTML 페이지는 구조가 바뀌면 파서 수정이 필요할 수 있습니다. 이 앱은 서버에서만 데이터를 수집하고, TTL 캐시와 에러 fallback으로 화면이 완전히 깨지지 않게 구성되어 있습니다.
