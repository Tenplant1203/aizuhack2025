import { Inter } from "next/font/google";
import Header from "@/components/ui/Header";
import "./globals.css";

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
    <html lang="ja" className={inter.variable}>
      <Header />
      <body className="font-sans">{children}</body>
    </html>
  );
}
