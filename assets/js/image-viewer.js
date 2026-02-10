(() => {
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";
  viewer.innerHTML = '<img alt="" />';
  const img = viewer.querySelector("img");
  document.body.appendChild(viewer);

  const close = () => viewer.classList.remove("is-open");

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest(".image-viewer")) {
      close();
      return;
    }

    if (target.matches("[data-zoom]")) {
      img.src = target.getAttribute("data-zoom") || target.getAttribute("src") || "";
      img.alt = target.getAttribute("alt") || "";
      viewer.classList.add("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
})();
