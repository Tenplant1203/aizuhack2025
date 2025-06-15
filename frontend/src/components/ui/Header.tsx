"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "./button";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

const navItems = [
  { label: "スレッド", href: "/threads" },
  { label: "スレッド作成", href: "/threads/new" },
  { label: "アーカイブ", href: "/threads/archived" },
  { label: "共有", href: "/share" },
  { label: "プロフィール", href: "/profile" },
];

export default function Header() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="mx-10 lg:mx-40 my-3 px-4 py-2 flex items-center lg:justify-center rounded-full bg-card border border-border sticky top-3 z-50 shadow-md">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/" className="text-xs font-medium leading-none">
            Threadly
          </Link>
        </Button>
      </div>
      <nav className="ml-auto hidden lg:block">
        {navItems.map(({ href, label }) => (
          <Button key={href} variant="ghost" asChild>
            <Link href={href} className="text-xs font-medium leading-none">
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      {session ? (
        <Button
          onClick={handleLogout}
          className="text-xs font-medium leading-none"
        >
          ログアウト
        </Button>
      ) : (
        <Button key="/auth/login" variant="ghost" asChild>
          <Link href="/auth/login" className="text-xs font-medium leading-none">
            ログイン
          </Link>
        </Button>
      )}
      <ThemeToggle />
    </header>
  );
}
