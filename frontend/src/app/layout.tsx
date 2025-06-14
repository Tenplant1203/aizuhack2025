import { Inter } from "next/font/google";
import Header from "@/components/ui/Header";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Our App",
  description: "Example of Inter font setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      {/* 
      suppressHydrationWarning:
      ThemeProvider の SSR と CSR のマークアップ差分による
      Hydration 警告を見えなくしたいので追加
      本番環境では出ないはずです
    */}
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
