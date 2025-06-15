import Router from '@koa/router';
import { PrismaClient } from '@prisma/client';
import Koa from 'koa';

const router = new Router();
const prisma = new PrismaClient();

interface Context extends Koa.Context {
  user?: any;
}

// ルートエンドポイント
router.get('/', async (ctx: Context) => {
  ctx.type = 'html';
  ctx.body = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>スレッド＆コメント テスト</title>
      <style>
        body { font-family: sans-serif; margin: 2em; }
        .thread { border: 1px solid #ccc; margin-bottom: 1em; padding: 1em; }
        .comments { margin-left: 1em; }
        .comment { border-top: 1px solid #eee; margin-top: 0.5em; padding-top: 0.5em; }
      </style>
    </head>
    <body>
      <h1>スレッド作成</h1>
      <h3>アカウント登録</h3>
      <form id="registerForm">
        <input name="name" placeholder="名前" required />
        <input name="email" placeholder="メールアドレス" required type="email" />
        <button type="submit">登録</button>
      </form>
      <div id="registerResult"></div>
      <h4>ユーザー一覧</h4>
      <ul id="userList"></ul>
      <form id="threadForm">
        <input type="number" name="userId" placeholder="ユーザーID" required />
        <input name="title" placeholder="タイトル" required />
        <input name="content" placeholder="内容" required />
        <button type="submit">作成</button>
      </form>
      <button id="resetBtn">データベース初期化</button>
      <div id="resetResult"></div>
      <h2>スレッド一覧</h2>
      <div id="threads"></div>
      <script>
        let replyTarget = null;
        let expanded = {};
        // 親情報を探す関数
        function findParentInfo(commentUuid, threadUuid) {
          var parentText = '';
          var threadDiv = document.getElementById('thread-comments-' + threadUuid);
          if (!threadDiv) return '';
          // 再帰的にコメントを探す
          function search(comments, parent) {
            for (var i = 0; i < comments.length; i++) {
              var c = comments[i];
              if (c.uuid == commentUuid) {
                if (parent) {
                  return '親: ' + (parent.uuid ? 'コメント（uuid=' + parent.uuid + '）' : 'スレッド（uuid=' + threadUuid + '）');
                } else {
                  return '親: スレッド（uuid=' + threadUuid + '）';
                }
              }
              if (c.children) {
                var found = search(c.children, c);
                if (found) return found;
              }
            }
            return '';
          }
          // threads配列を取得して該当スレッドのコメントツリーを探索
          if (window._lastThreads) {
            var thread = window._lastThreads.find(function(t) { return t.uuid == threadUuid; });
            if (thread) {
              return search(thread.comments, null);
            }
          }
          return '';
        }
        // fetchThreadsでthreadsをwindowに保存
        async function fetchThreads(focusUuid) {
          const res = await fetch('/threads');
          const threads = await res.json();
          window._lastThreads = threads;
          const el = document.getElementById('threads');
          el.innerHTML = '';
          threads.forEach(function(thread) {
            const div = document.createElement('div');
            div.className = 'thread';
            div.innerHTML =
              '<strong data-type="thread" data-uuid="' + thread.uuid + '" class="clickable">' + thread.title + '</strong> by ユーザーID:' + thread.userId + '<br />' +
              '<div>' + thread.content + '</div>' +
              '<div class="comments" id="thread-comments-' + thread.uuid + '">' +
              renderChildren(thread.comments, thread.uuid, 'thread') +
              '</div>';
            el.appendChild(div);
          });
          document.querySelectorAll('.clickable[data-type="thread"]').forEach(function(el) {
            el.addEventListener('click', function() {
              const uuid = this.getAttribute('data-uuid');
              expanded['thread-' + uuid] = !expanded['thread-' + uuid];
              renderThreadChildren(uuid);
            });
          });
          // 返信直後に親を自動展開
          if (focusUuid) {
            expanded['comment-' + focusUuid] = true;
          }
        }
        function renderChildren(comments, parentUuid, parentType) {
          if (!Array.isArray(comments)) return '';
          var html = '';
          comments.forEach(function(c) {
            var hasChildren = c.children && c.children.length > 0;
            html += '<div class="comment" data-type="comment" data-uuid="' + c.uuid + '">' +
              '<span class="clickable" data-type="comment" data-uuid="' + c.uuid + '">' + c.content + ' (by ユーザーID:' + c.userId + ')</span>';
            if (hasChildren) {
              var isExpanded = expanded['comment-' + c.uuid];
              html += ' <button type="button" class="toggle-children" data-uuid="' + c.uuid + '" data-thread-uuid="' + findThreadUuidByComment(c.uuid) + '">' + (isExpanded ? '−' : '+') + '</button>';
              html += '<div class="comments" id="comment-children-' + c.uuid + '" style="display:' + (isExpanded ? 'block' : 'none') + ';">' +
                renderChildren(c.children, c.uuid, 'comment') +
                '</div>';
            } else {
              html += '<div class="comments" id="comment-children-' + c.uuid + '"></div>';
            }
            html += '</div>';
          });
          return html;
        }
        // コメントuuidからスレッドuuidを取得する関数
        function findThreadUuidByComment(commentUuid) {
          if (!window._lastThreads) return '';
          for (var i = 0; i < window._lastThreads.length; i++) {
            var thread = window._lastThreads[i];
            if (search(thread.comments, commentUuid)) return thread.uuid;
          }
          function search(comments, uuid) {
            for (var j = 0; j < comments.length; j++) {
              var c = comments[j];
              if (c.uuid == uuid) return true;
              if (c.children && search(c.children, uuid)) return true;
            }
            return false;
          }
          return '';
        }
        // スレッドの子要素を描画
        function renderThreadChildren(threadUuid) {
          fetch('/threads').then(function(res) { return res.json(); }).then(function(threads) {
            window._lastThreads = threads;
            var thread = threads.find(function(t) { return t.uuid == threadUuid; });
            var el = document.getElementById('thread-comments-' + threadUuid);
            el.innerHTML = renderChildren(thread.comments, threadUuid, 'thread');
            document.querySelectorAll('.clickable[data-type="comment"]').forEach(function(el) {
              el.addEventListener('click', function(e) {
                e.stopPropagation();
                var uuid = this.getAttribute('data-uuid');
                expanded['comment-' + uuid] = expanded['comment-' + uuid] ? expanded['comment-' + uuid] : false;
                renderCommentChildren(uuid, threadUuid);
              });
            });
            document.querySelectorAll('.toggle-children').forEach(function(btn) {
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var uuid = this.getAttribute('data-uuid');
                var threadUuid = this.getAttribute('data-thread-uuid');
                expanded['comment-' + uuid] = !expanded['comment-' + uuid];
                renderThreadChildren(threadUuid);
              });
            });
          });
        }
        function renderCommentChildren(commentUuid, threadUuid) {
          fetch('/threads').then(function(res) { return res.json(); }).then(function(threads) {
            window._lastThreads = threads;
            var thread = threads.find(function(t) { return t.uuid == threadUuid; });
            function findComment(comments, uuid) {
              for (var i = 0; i < comments.length; i++) {
                var c = comments[i];
                if (c.uuid == uuid) return c;
                if (c.children) {
                  var found = findComment(c.children, uuid);
                  if (found) return found;
                }
              }
              return null;
            }
            var comment = findComment(thread.comments, commentUuid);
            var el = document.getElementById('comment-children-' + commentUuid);
            el.innerHTML = renderChildren(comment.children || [], commentUuid, 'comment');
            document.querySelectorAll('.clickable[data-type="comment"]').forEach(function(el) {
              el.addEventListener('click', function(e) {
                e.stopPropagation();
                var uuid = this.getAttribute('data-uuid');
                expanded['comment-' + uuid] = expanded['comment-' + uuid] ? expanded['comment-' + uuid] : false;
                renderCommentChildren(uuid, threadUuid);
              });
            });
            document.querySelectorAll('.toggle-children').forEach(function(btn) {
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var uuid = this.getAttribute('data-uuid');
                var threadUuid = this.getAttribute('data-thread-uuid');
                expanded['comment-' + uuid] = !expanded['comment-' + uuid];
                renderCommentChildren(uuid, threadUuid);
              });
            });
          });
        }
        document.addEventListener('click', function(e) {
          if (e.target.classList && e.target.classList.contains('clickable') && e.target.dataset.type === 'comment') {
            e.stopPropagation();
            var uuid = e.target.dataset.uuid;
            var threadUuid = findThreadUuid(e.target);
            // 親情報を探す
            var parentInfo = findParentInfo(uuid, threadUuid);
            replyTarget = { type: 'comment', uuid: uuid, threadUuid: threadUuid };
            showReplyForm(parentInfo);
          } else if (e.target.classList && e.target.classList.contains('clickable') && e.target.dataset.type === 'thread') {
            replyTarget = { type: 'thread', uuid: e.target.dataset.uuid };
            showReplyForm('親: スレッド（uuid=' + e.target.dataset.uuid + '）');
          }
        });
        function findThreadUuid(el) {
          var node = el;
          while (node && !node.closest('.thread')) node = node.parentElement;
          return node && node.closest('.thread') && node.closest('.thread').querySelector('.clickable[data-type="thread"]').getAttribute('data-uuid');
        }
        function showReplyForm(parentInfo) {
          var formHtml = '';
          if (replyTarget) {
            formHtml =
              '<form id="replyForm">' +
              '<input type="number" name="userId" placeholder="ユーザーID" required />' +
              '<input name="content" placeholder="内容" required />' +
              '<button type="submit">返信</button>' +
              '</form>' +
              '<div>返信先: ' + (replyTarget.type === 'thread' ? 'スレッド' : 'コメント') + ' UUID=' + replyTarget.uuid + '</div>' +
              (parentInfo ? '<div style="color:gray">' + parentInfo + '</div>' : '');
          }
          document.getElementById('replyArea').innerHTML = formHtml;
          if (replyTarget) {
            document.getElementById('replyForm').addEventListener('submit', function(e) {
              e.preventDefault();
              var fd = new FormData(e.target);
              var userId = fd.get('userId');
              var content = fd.get('content');
              var parentType = replyTarget.type;
              var parentUuid = replyTarget.uuid;
              fetch('/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  content: content,
                  parentType: parentType,
                  parentUuid: parentUuid
                })
              }).then(function() {
                fetchThreads(parentUuid); // 返信先を自動展開
              });
              replyTarget = null;
              document.getElementById('replyArea').innerHTML = '';
            });
          }
        }
        document.getElementById('threadForm').addEventListener('submit', function(e) {
          e.preventDefault();
          var fd = new FormData(e.target);
          var userId = fd.get('userId');
          var title = fd.get('title');
          var content = fd.get('content');
          fetch('/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, title: title, content: content })
          }).then(fetchThreads);
        });
        document.getElementById('registerForm').addEventListener('submit', function(e) {
          e.preventDefault();
          var fd = new FormData(e.target);
          var name = fd.get('name');
          var email = fd.get('email');
          fetch('/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email })
          }).then(async (res) => {
            const data = await res.json();
            document.getElementById('registerResult').innerText = data.error ? data.error : '登録成功! ユーザーID: ' + data.id;
            fetchUsers();
          });
        });
        function fetchUsers() {
          fetch('/user').then(function(res) { return res.json(); }).then(function(users) {
            document.getElementById('userList').innerHTML = users.map(function(u) {
              return '<li>ID: ' + u.id + ' / ' + u.name + ' / ' + u.email + '</li>';
            }).join('');
          });
        }
        document.getElementById('resetBtn').addEventListener('click', function() {
          fetch('/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              document.getElementById('resetResult').innerText = data.message;
              fetchThreads();
            });
        });
        fetchThreads();
        fetchUsers();
      </script>
      <div id="replyArea"></div>
    </body>
    </html>
  `;
});

export default router;
