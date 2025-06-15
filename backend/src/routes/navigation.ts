// ツリー構造のノード定義
export class Node {
  content: string;
  children: Node[];

  constructor(content: string) {
    this.content = content;
    this.children = [];
  }
}

// ツリークラス
export class Tree {
  root: Node;

  constructor() {
    this.root = new Node('root');
  }

  // ノードを追加：親ノードと内容を指定
  addChild(parent: Node, content: string): Node {
    const child = new Node(content);
    parent.children.push(child);
    return child;
  }

  // 再帰的に木を表示（console.logで出力）
  printTree(node: Node = this.root, depth: number = 0): void {
    console.log(`${'  '.repeat(depth)}- ${node.content}`);
    for (const child of node.children) {
      this.printTree(child, depth + 1);
    }
  }

  getRoot(): Node {
    return this.root;
  }
}

// スレッド（根）とコメント（枝）を表現する拡張
export class Thread extends Node {
  constructor(content: string) {
    super(content);
  }
}

export class Comment extends Node {
  constructor(content: string) {
    super(content);
  }
}

// スレッドツリー
export class ThreadTree {
  threads: Thread[] = [];

  // スレッド（根）を追加
  addThread(content: string): Thread {
    const thread = new Thread(content);
    this.threads.push(thread);
    return thread;
  }

  // コメント（枝）を追加
  addComment(parent: Node, content: string): Comment {
    const comment = new Comment(content);
    parent.children.push(comment);
    return comment;
  }

  // 全スレッドを表示
  printAll(): void {
    for (const thread of this.threads) {
      this.printTree(thread);
    }
  }

  // 再帰的に木を表示
  printTree(node: Node, depth: number = 0): void {
    console.log(`${'  '.repeat(depth)}- ${node.content}`);
    for (const child of node.children) {
      this.printTree(child, depth + 1);
    }
  }
}