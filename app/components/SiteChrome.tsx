"use client";

import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "./AnalyticsTracker";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isMaintenance = pathname === "/maintenance";

  // Don't show header/footer on admin or maintenance pages
  if (isAdmin || isMaintenance) {
    return <>{children}</>;
  }

  return (
    <>
      <AnalyticsTracker />
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}
