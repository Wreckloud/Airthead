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
  let didPinch = false;
  const pointers = new Map();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getDistance = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  };

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
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    didPinch = false;
    moved = false;
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      pinchStartDistance = getDistance(p1, p2);
      pinchStartScale = scale;
      isDragging = false;
    } else {
      isDragging = true;
      startX = event.clientX - translateX;
      startY = event.clientY - translateY;
    }
    img.setPointerCapture(event.pointerId);
  });

  img.addEventListener("pointermove", (event) => {
    if (!viewer.classList.contains("is-open")) return;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const distance = getDistance(p1, p2);
      if (pinchStartDistance > 0) {
        scale = clamp(pinchStartScale * (distance / pinchStartDistance), 1, 4);
        didPinch = true;
        setTransform();
      }
      return;
    }

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
    if (img.hasPointerCapture(event.pointerId)) {
      img.releasePointerCapture(event.pointerId);
    }
    pointers.delete(event.pointerId);
    if (pointers.size < 2) {
      pinchStartDistance = 0;
    }
    if (pointers.size === 0) {
      isDragging = false;
    }

    if (event.pointerType === "touch" && !moved && !didPinch) {
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
