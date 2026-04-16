import Link from "next/link";

const sourceRules = [
  "KBO Live Now는 비공식 팬 서비스이며 KBO 공식 앱 또는 공식 서비스가 아닙니다.",
  "경기 일정, 스코어, 순위, 선수 기록 등은 KBO 공식 사이트를 우선 참고하고, 뉴스와 선수 소식은 네이버 스포츠, 다음 스포츠 및 각 언론사 원문 링크를 보조로 연결합니다.",
  "KBO, 네이버, 다음, 각 언론사의 명칭과 출처를 명확히 표기합니다.",
  "뉴스는 제목, 출처, 원문 링크만 유지하며 기사 본문 전체를 복제하거나 저장하지 않습니다.",
  "기사 이미지, 영상, 하이라이트, 중계 영상은 저장하거나 직접 재생하지 않고 공식 페이지 링크로만 안내합니다.",
  "팀 로고와 공식 마스코트 이미지는 사용하지 않고 이모지, 텍스트, 팀 대표 색상 중심으로 표현합니다."
];

const commercialRules = [
  "무료 공개 팬 서비스라도 데이터 제공사의 이용 조건을 계속 확인합니다.",
  "광고, 후원, 유료 결제, 구독, 앱 판매, 데이터 재판매 전에는 KBO 또는 데이터 제공사와 라이선스 가능 여부를 확인해야 합니다.",
  "데이터 구조 변경, 접근 제한, 저작권 또는 상표권 요청이 있을 경우 관련 기능을 중단하거나 수정할 수 있습니다."
];

export default function TermsPage() {
  return (
    <main className="px-4 py-8 text-ink sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black text-[#ff6b00] hover:underline">
          홈으로 돌아가기
        </Link>

        <section className="mt-5 rounded-lg border border-line bg-white p-5 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-normal text-[#ff6b00]">Terms & Source Notice</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">이용 안내 및 출처 고지</h1>
          <p className="mt-4 text-base font-semibold leading-relaxed text-ink/65">
            이 앱은 한국 프로야구 팬이 경기 일정, 스코어, 기록, 뉴스 링크를 빠르게 확인하기 위한
            비공식 팬 서비스입니다. 공식 기록과 권리자의 콘텐츠를 존중하는 방식으로 운영합니다.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black">출처와 콘텐츠 사용</h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-relaxed text-ink/70">
              {sourceRules.map((rule) => (
                <li key={rule} className="rounded-md bg-[#f8fafc] p-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black">공개와 상업적 이용</h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-relaxed text-ink/70">
              {commercialRules.map((rule) => (
                <li key={rule} className="rounded-md bg-[#f8fafc] p-3">
                  {rule}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg border border-[#ff6b00]/20 bg-orange-50 p-4">
              <p className="text-sm font-black text-[#b54700]">운영 원칙</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#7a3a00]">
                문제가 될 수 있는 요청이나 권리자 안내가 들어오면 해당 데이터 노출, 링크, 문구를 우선 조정합니다.
                이 페이지는 법률 자문이 아니라 서비스 운영을 위한 기본 고지입니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
