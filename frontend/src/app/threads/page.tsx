import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateThreadPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">スレッド作成</h1>
      <form className="space-y-4">
        {/* タイトル */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            タイトル
          </label>
          <Input id="title" placeholder="例: 今週末の勉強会について" />
        </div>
        {/* 本文 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            本文
          </label>
          <Textarea id="content" placeholder="本文を入力…" rows={6} />
        </div>
        {/* 送信 */}
        <div className="flex flex-wrap items-center gap-2 md:flex-row">
          <Button>Button</Button>
        </div>
      </form>
    </div>
  );
}
