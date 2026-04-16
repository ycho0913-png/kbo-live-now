import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import ComplianceNotice from "@/components/ComplianceNotice";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "KBO Live Now",
  description: "KBO 실시간 점수, 일정, 순위, 기록, 뉴스",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "KBO NOW",
    statusBarStyle: "default"
  },
  icons: {
    icon: "/icons/kbo-live-icon.svg",
    apple: "/icons/kbo-live-icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b4ea2"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <ComplianceNotice />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
