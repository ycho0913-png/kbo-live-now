import Link from "next/link";

export default function ComplianceNotice() {
  return (
    <section className="border-t border-line bg-white/90 px-4 py-6 text-ink">
      <div className="mx-auto grid max-w-6xl gap-4 rounded-lg border border-line bg-[#f8fafc] p-4 shadow-soft sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-black text-[#ff6b00]">비공식 팬 서비스 안내</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink/70">
            KBO Live Now는 KBO 공식 앱 또는 공식 서비스가 아닙니다. KBO, 네이버, 다음 및 각 언론사의
            출처를 존중하며, 뉴스는 제목, 출처, 원문 링크 중심으로 연결합니다.
          </p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-ink/55">
            기사 본문, 이미지, 영상은 저장하지 않으며 영상 기록과 하이라이트는 공식 링크로만 안내합니다.
            광고, 유료 결제, 판매 전에는 KBO 또는 데이터 제공사와 별도 라이선스 확인이 필요합니다.
          </p>
        </div>
        <Link
          href="/terms"
          className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 text-sm font-black text-white hover:bg-[#ff6b00]"
        >
          약관 보기
        </Link>
      </div>
    </section>
  );
}
