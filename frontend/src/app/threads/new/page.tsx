"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateThreadPage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("auth/login");
    }
  }, [session, router]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">スレッド作成</h1>
      <form className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            タイトル
          </label>
          <Input id="title" placeholder="例: 今週末の勉強会について" />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            本文
          </label>
          <Textarea id="content" placeholder="本文を入力…" rows={6} />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:flex-row">
          <Button>スレッド作成</Button>
        </div>
      </form>
    </div>
  );
}
