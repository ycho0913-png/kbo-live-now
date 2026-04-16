import type { Metadata } from "next";
import Header from "@/components/Header";
import ComplianceNotice from "@/components/ComplianceNotice";
import "./globals.css";

export const metadata: Metadata = {
  title: "KBO Live Now",
  description: "KBO 실시간 점수, 일정, 순위, 기록, 뉴스"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <ComplianceNotice />
      </body>
    </html>
  );
}
