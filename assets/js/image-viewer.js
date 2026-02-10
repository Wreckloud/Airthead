(() => {
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";
  viewer.innerHTML = '<img alt="" />';
  const img = viewer.querySelector("img");
  img.draggable = false;
  document.body.appendChild(viewer);

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let lastTap = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const setTransform = () => {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    viewer.classList.toggle("is-zoomed", scale > 1);
  };

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt;
    scale = 1;
    translateX = 0;
    translateY = 0;
    setTransform();
    viewer.classList.add("is-open");
    document.body.classList.add("viewer-open");
    document.documentElement.classList.add("viewer-open");
  };

  const close = () => {
    viewer.classList.remove("is-open");
    document.body.classList.remove("viewer-open");
    document.documentElement.classList.remove("viewer-open");
    scale = 1;
    translateX = 0;
    translateY = 0;
    setTransform();
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches("[data-zoom]")) {
      open(
        target.getAttribute("data-zoom") || target.getAttribute("src") || "",
        target.getAttribute("alt") || ""
      );
    }
  });

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  viewer.addEventListener(
    "wheel",
    (event) => {
      if (!viewer.classList.contains("is-open")) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.15 : 0.15;
      scale = clamp(Number((scale + delta).toFixed(2)), 1, 4);
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      setTransform();
    },
    { passive: false }
  );

  const toggleZoom = () => {
    if (scale > 1) {
      scale = 1;
      translateX = 0;
      translateY = 0;
    } else {
      scale = 2.2;
    }
    setTransform();
  };

  img.addEventListener("dblclick", (event) => {
    if (!viewer.classList.contains("is-open")) return;
    event.preventDefault();
    toggleZoom();
  });

  img.addEventListener("pointerdown", (event) => {
    if (!viewer.classList.contains("is-open")) return;
    isDragging = true;
    moved = false;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    img.setPointerCapture(event.pointerId);
  });

  img.addEventListener("pointermove", (event) => {
    if (!isDragging || scale <= 1) return;
    const nextX = event.clientX - startX;
    const nextY = event.clientY - startY;
    if (Math.abs(nextX - translateX) > 2 || Math.abs(nextY - translateY) > 2) {
      moved = true;
    }
    translateX = nextX;
    translateY = nextY;
    setTransform();
  });

  const handlePointerUp = (event) => {
    if (!isDragging) return;
    isDragging = false;
    if (img.hasPointerCapture(event.pointerId)) {
      img.releasePointerCapture(event.pointerId);
    }

    if (event.pointerType === "touch" && !moved) {
      const now = Date.now();
      if (now - lastTap < 260) {
        toggleZoom();
        lastTap = 0;
        return;
      }
      lastTap = now;
    }
  };

  img.addEventListener("pointerup", handlePointerUp);
  img.addEventListener("pointercancel", handlePointerUp);
})();
