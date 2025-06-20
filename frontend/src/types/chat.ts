export type User = { id: number; name: string };

export type CommentNode = {
  uuid: string;
  content: string;
  createdAt: string;
  user?: User;
  children?: CommentNode[];
};

export type ThreadDetail = {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  user: User;
  comments: CommentNode[];
};
