"use client";

import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "./AnalyticsTracker";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
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
