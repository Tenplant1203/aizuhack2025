"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConfirmPage() {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get("status");

  // 成功なら3秒後にリダイレクト
  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => router.replace("/auth/login"), 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {status === "success" ? (
        <>
          <h1 className="text-2xl font-bold mb-2">✅ 認証完了</h1>
          <p>自動でログインページに移動します…</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">⚠️ 認証失敗</h1>
          <p>リンクが無効です。再度サインアップしてください。</p>
          <Button
            className="mt-4"
            onClick={() => router.replace("/auth/signup")}
          >
            新規登録へ
          </Button>
        </>
      )}
    </div>
  );
}
