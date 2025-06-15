"use client";

import { Inter } from "next/font/google";
import Header from "@ui/Header";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ReactNode, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient({
      auth: { persistSession: true, detectSessionInUrl: false },
    }),
  );

  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <SessionContextProvider supabaseClient={supabaseClient}>
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
