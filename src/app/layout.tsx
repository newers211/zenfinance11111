import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenFinance — Track income, expenses & balance",
  description: "Simple personal finance app. Log expenses and income, manage categories, see your balance and charts. Clean, fast, no clutter.",
};

// Inline script: apply saved theme before React hydrates to avoid flash
const themeScript = `
(function() {
  var html = document.documentElement;
  
  try {
    var raw = localStorage.getItem('zen-finance-storage');
    if (raw) {
      var data = JSON.parse(raw);
      if (data.state && data.state.theme) {
        html.setAttribute('data-theme', data.state.theme);
        return;
      }
    }
  } catch (e) {
    // ошибка при чтении localStorage
  }
  
  // По умолчанию - темная тема
  html.setAttribute('data-theme', 'dark');
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
