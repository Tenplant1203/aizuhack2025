import { BASE_URL } from "@/lib/constants";
import ThreadList, { Thread } from "@/features/threads/ThreadList";

export const metadata = { title: "スレッド一覧" };

export default async function ThreadsPage() {
  const res = await fetch(`${BASE_URL}/threads`, { cache: "no-store" });

  if (!res.ok) {
    return <p className="p-4 text-red-600">API エラー: {res.status}</p>;
  }

  const threads = (await res.json()) as Thread[];
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">スレッド一覧</h1>
      <ThreadList threads={threads} />
    </main>
  );
}
