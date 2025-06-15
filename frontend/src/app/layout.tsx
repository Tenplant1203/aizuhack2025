"use client";

import { Inter } from "next/font/google";
import Header from "@ui/Header";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabaseClient] = useState(() => createClientComponentClient());

  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={null}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
          </ThemeProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
