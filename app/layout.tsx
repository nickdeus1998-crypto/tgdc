import SiteChrome from "./components/SiteChrome";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import I18nProvider from "./components/I18nProvider";
import { Poppins } from "next/font/google";
import WeglotLoader from "./components/WeglotLoader";
import PreviewBanner from "./components/PreviewBanner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "TGDC | Tanzania Geothermal Development Company",
  description: "Leading sustainable geothermal energy solutions in Tanzania.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body className={poppins.className}>
        <WeglotLoader />
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
          <I18nProvider>
            <PreviewBanner />
            <SiteChrome>
              {children}
            </SiteChrome>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
