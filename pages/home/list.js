const renderMeta = (post) =>
  [post.date, ...post.tags].map((part) => `<span>${part}</span>`).join("");

const renderItem = (post) => {
    const postTitle = encodeURIComponent(post.title);
  const desc = post.desc ? `<p class="post-summary">${post.desc}</p>` : "";
  return `
    <li class="post-item">
      <a class="post-link" href="../post/index.html?title=${postTitle}">
        <h3 class="post-title">${post.title}</h3>
        ${desc}
        <div class="post-meta">${renderMeta(post)}</div>
      </a>
    </li>
  `;
};

// 渲染首页列表。
const renderList = (posts) => {
  const list = document.querySelector("[data-post-list]");
  list.innerHTML = posts.map(renderItem).join("");
};

const posts = window.POSTS;
renderList(posts);
