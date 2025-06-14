"use client";

import { Button } from "./button";
import Link from "next/link";

const navItems = [{ href: "#home", label: "ホーム" }];

export default function Header() {
  return (
    <header className="">
      <div></div>

      <nav className="ml-auto hidden lg:block">
        {navItems.map(({ href, label }) => (
          <Button key={href} variant="ghost" asChild>
            <Link href={href} className="text-xs font-medium leading-none">
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </header>
  );
}
