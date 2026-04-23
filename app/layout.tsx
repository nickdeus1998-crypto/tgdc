import SiteChrome from "./components/SiteChrome";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import I18nProvider from "./components/I18nProvider";
import { Poppins } from "next/font/google";
import PreviewBanner from "./components/PreviewBanner";
import Script from "next/script";

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
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
          <I18nProvider>
            <PreviewBanner />
            <SiteChrome>
              {children}
            </SiteChrome>
          </I18nProvider>
        </ThemeProvider>

        <div id="google_translate_element" className="google-translate-hidden"></div>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,sw',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
