"use client";
import Link from "next/link";

export type Thread = {
  uuid: string;
  title: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

export default function ThreadList({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return <p className="p-4">まだスレッドがありません。</p>;
  }
  return (
    <ul className="space-y-4 p-4">
      {threads.map((t) => (
        <li key={t.uuid} className="border p-4 rounded">
          <Link href={`/threads/${t.uuid}`}>
            <h3 className="font-semibold">{t.title}</h3>
            <p className="mt-2 text-sm text-gray-600">
              by {t.user.name} at {new Date(t.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 line-clamp-2">{t.content}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
