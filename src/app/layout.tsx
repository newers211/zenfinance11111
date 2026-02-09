import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

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
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
