// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"], // 必要に応じて "latin-ext" なども追加
  variable: "--font-inter", // カスタムプロパティとしても使える
  display: "swap", // FOUTを減らす
});

export const metadata = {
  title: "Your App",
  description: "Example of Inter font setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
