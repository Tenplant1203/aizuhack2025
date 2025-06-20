import { mapCommentsToFlow } from "../lib/flowMapper";
import type { ThreadDetail } from "../types/chat";

const mock: ThreadDetail = {
  uuid: "root",
  title: "demo",
  content: "",
  createdAt: "",
  user: { id: 1, name: "Tester" },
  comments: [
    {
      uuid: "c1",
      content: "hello",
      createdAt: "",
      user: { id: 1, name: "A" },
      children: [
        {
          uuid: "c1-1",
          content: "child",
          createdAt: "",
          user: { id: 2, name: "B" },
        },
      ],
    },
  ],
};

console.log(mapCommentsToFlow(mock.comments));
