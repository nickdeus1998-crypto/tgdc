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
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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

        <div id="google_translate_element" style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: -1 }}></div>
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,sw',
                autoDisplay: false
              }, 'google_translate_element');
            };
            (function() {
              var gt = document.createElement('script');
              gt.type = 'text/javascript';
              gt.async = true;
              gt.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(gt, s);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
