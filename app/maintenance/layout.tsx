import "../globals.css";
import { ThemeProvider } from "next-themes";
import I18nProvider from "../components/I18nProvider";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export default function MaintenanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Site Under Maintenance - TGDC</title>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                />
            </head>
            <body className={poppins.className}>
                <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
                    <I18nProvider>
                        {children}
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
