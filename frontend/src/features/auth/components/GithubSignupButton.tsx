"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@ui/button";

export default function GithubSignupButton() {
  const supabase = useSupabaseClient();

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL,
      },
    });
    if (error) {
      alert("Githubでの登録に失敗しました" + error.message);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full cursor-pointer"
      onClick={handleGithubLogin}
    >
      Githubで登録
    </Button>
  );
}
