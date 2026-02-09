// 页面位于 pages/post/，资源在项目根目录下。
const BASE_PATH = "../../";

// 将相对路径补齐到根目录。
const resolvePath = (path) =>
  /^(https?:)?\/\//.test(path) || path.startsWith("/") ? path : `${BASE_PATH}${path}`;

// 渲染图片列表，并对长图做窄幅处理。
const renderImages = (post, container) => {
  container.innerHTML = "";
  if (!post.images.length) {
    container.style.display = "none";
    return;
  }

  const fragment = document.createDocumentFragment();
  post.images.forEach((src) => {
    const img = document.createElement("img");
    img.src = resolvePath(src);
    img.alt = post.desc || post.title;
    img.addEventListener("load", () => {
      const ratio = img.naturalHeight / (img.naturalWidth || 1);
      if (ratio >= 1.6) img.classList.add("is-tall");
    });
    fragment.appendChild(img);
  });
  container.appendChild(fragment);
  container.style.display = "grid";
};

// 加载正文 txt，并按空行分段。
const renderBody = async (post, container) => {
  container.innerHTML = "";
  if (!post.body) {
    container.style.display = "none";
    return;
  }

  try {
    const response = await fetch(resolvePath(post.body));
    const text = response.ok ? await response.text() : "";
    const clean = text.replace(/\r\n/g, "\n").trim();
    if (!clean) {
      container.style.display = "none";
      return;
    }

    const block = document.createElement("section");
    block.className = "article-section";
    clean.split(/\n{2,}/).forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) return;
      const p = document.createElement("p");
      trimmed.split("\n").forEach((line, idx, arr) => {
        p.appendChild(document.createTextNode(line));
        if (idx < arr.length - 1) {
          p.appendChild(document.createElement("br"));
        }
      });
      block.appendChild(p);
    });

    container.appendChild(block);
    container.style.display = "block";
  } catch {
    container.style.display = "none";
  }
};

// 渲染文章详情页（标题、摘要、元信息、图片、正文）。
const renderPost = async (posts) => {
  const params = new URLSearchParams(window.location.search);
  const rawTitle = params.get("title");
  const titleParam = rawTitle ? decodeURIComponent(rawTitle) : "";
  const post = posts.find((item) => item.title === titleParam);

  const article = document.querySelector("[data-article]");
  if (!post) {
    article.innerHTML = `
      <div class="not-found">
        这篇文章的内容被我吃掉了，回到首页重新选择吧。
      </div>
    `;
    return;
  }

  document.title = `${post.title} · Airthead`;

  const title = document.querySelector("[data-post-title]");
  const summary = document.querySelector("[data-post-summary]");
  const meta = document.querySelector("[data-post-meta]");
  const heroWrap = document.querySelector("[data-post-hero]");
  const content = document.querySelector("[data-post-content]");

  title.textContent = post.title;
  summary.textContent = post.desc;
  summary.style.display = post.desc ? "block" : "none";

  const metaParts = [post.date, ...post.tags];
  meta.textContent = metaParts.join(" · ");
  meta.style.display = metaParts.length ? "flex" : "none";

  renderImages(post, heroWrap);
  await renderBody(post, content);
};

renderPost(window.POSTS);
