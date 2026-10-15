(() => {
  "use strict";

  // Public batch metadata only. Never put SP-TOKEN, passwords, or secret API keys here.
  const API_BASE = "https://pw.studyparcham.in/api/batches";
  const PAGE_SIZE = 10;

  const $ = (id) => document.getElementById(id);
  const grid = $("batchGrid");
  const input = $("searchInput");
  const clear = $("clearSearch");
  const count = $("batchCount");
  const shown = $("shownCount");
  const status = $("status");
  const empty = $("emptyState");
  const error = $("errorState");
  const dialog = $("batchDialog");
  const dialogTitle = $("dialogTitle");
  const dialogId = $("dialogBatchId");
  const dialogStatus = $("dialogStatus");
  const dialogImageWrap = $("dialogImageWrap");
  const copyButton = $("copyBatchId");
  const closeButton = $("closeDialog");
  const loadMoreButton = $("loadMore");

  let batches = [];
  let localBatches = [];
  let selectedBatchId = "";
  let currentPage = 1;
  let sourceMode = "local";
  let loadingMore = false;
  let hasMore = false;

  const safeText = (value) => String(value ?? "");

  function normalizeBatch(item) {
    if (!item || typeof item !== "object") return null;
    const id = item.id ?? item._id ?? item.batchId ?? item.batch_id ?? item.slug ?? "";
    const name = item.name ?? item.batchName ?? item.batch_name ?? item.title ?? item.courseName ?? "";
    const imageUrl = item.imageUrl ?? item.image_url ?? item.image ?? item.thumbnail ?? item.thumbnailUrl ?? item.banner ?? item.coverImage ?? "";
    if (!id && !name) return null;
    return { id: safeText(id), name: safeText(name || "Untitled batch"), imageUrl: safeText(imageUrl) };
  }

  function extractArray(payload, depth = 0) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object" || depth > 5) return [];

    const preferredKeys = ["batches", "items", "results", "docs", "records", "data", "result"];
    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const found = extractArray(payload[key], depth + 1);
        if (found.length) return found;
      }
    }
    for (const value of Object.values(payload)) {
      if (Array.isArray(value) && value.some((item) => item && typeof item === "object")) return value;
    }
    return [];
  }

  function normalizeList(payload) {
    return extractArray(payload).map(normalizeBatch).filter(Boolean);
  }

  const isImageUrl = (value) => /^https?:\/\//i.test(safeText(value));
  const matchesBatch = (batch, query) =>
    safeText(batch.name).toLocaleLowerCase().includes(query) ||
    safeText(batch.id).toLocaleLowerCase().includes(query);

  function openBatch(batch) {
    selectedBatchId = safeText(batch.id);
    dialogTitle.textContent = safeText(batch.name) || "Untitled batch";
    dialogId.textContent = selectedBatchId || "No batch ID";
    dialogStatus.textContent = "Batch metadata loaded. This ID is not a video URL.";
    dialogImageWrap.replaceChildren();

    if (isImageUrl(batch.imageUrl)) {
      const img = document.createElement("img");
      img.src = batch.imageUrl;
      img.alt = safeText(batch.name);
      img.onerror = () => {
        const fallback = document.createElement("div");
        fallback.className = "dialog-image-fallback";
        fallback.textContent = "Study Library";
        dialogImageWrap.replaceChildren(fallback);
      };
      dialogImageWrap.append(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "dialog-image-fallback";
      fallback.textContent = "Study Library";
      dialogImageWrap.append(fallback);
    }

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function render() {
    const query = input.value.trim().toLocaleLowerCase();
    const filtered = batches.filter((batch) => matchesBatch(batch, query));
    grid.replaceChildren();
    const fragment = document.createDocumentFragment();

    filtered.forEach((batch) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card card-button";
      card.setAttribute("aria-label", `Open ${safeText(batch.name) || "batch"} details`);
      card.addEventListener("click", () => openBatch(batch));

      const cover = document.createElement("div");
      cover.className = "cover";
      if (isImageUrl(batch.imageUrl)) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = safeText(batch.name);
        img.src = batch.imageUrl;
        img.onerror = () => {
          img.remove();
          const fallback = document.createElement("span");
          fallback.className = "cover-fallback";
          fallback.textContent = "▧";
          cover.append(fallback);
        };
        cover.append(img);
      } else {
        const fallback = document.createElement("span");
        fallback.className = "cover-fallback";
        fallback.textContent = "▧";
        cover.append(fallback);
      }

      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h3");
      title.textContent = safeText(batch.name) || "Untitled batch";
      const meta = document.createElement("div");
      meta.className = "card-meta";
      const label = document.createElement("span");
      label.className = "tag";
      label.textContent = "Batch";
      const id = document.createElement("span");
      id.className = "id-label";
      id.textContent = batch.id ? `ID ${safeText(batch.id).slice(0, 8)}` : "No ID";
      meta.append(label, id);
      const action = document.createElement("span");
      action.className = "card-open-hint";
      action.textContent = "View details ↗";
      body.append(title, meta, action);
      card.append(cover, body);
      fragment.append(card);
    });

    grid.append(fragment);
    shown.textContent = `${filtered.length.toLocaleString()} shown`;
    empty.hidden = filtered.length !== 0;
    loadMoreButton.hidden = sourceMode !== "api" || !hasMore || query.length > 0;
    count.textContent = `${batches.length.toLocaleString()} batches loaded`;
  }

  async function fetchApiPage(page) {
    const url = `${API_BASE}?page=${encodeURIComponent(page)}&limit=${PAGE_SIZE}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      mode: "cors",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Batch API returned HTTP ${response.status}`);
    const payload = await response.json();
    const result = normalizeList(payload);
    if (!result.length) throw new Error("The batch API returned an unfamiliar JSON format");
    return result;
  }

  async function loadNextPage() {
    if (loadingMore || !hasMore || sourceMode !== "api") return;
    loadingMore = true;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading…";
    try {
      const nextPage = currentPage + 1;
      const next = await fetchApiPage(nextPage);
      const seen = new Set(batches.map((batch) => batch.id).filter(Boolean));
      const unique = next.filter((batch) => !batch.id || !seen.has(batch.id));
      if (!unique.length) {
        hasMore = false;
        status.textContent = "No more new batches returned";
      } else {
        batches = batches.concat(unique);
        currentPage = nextPage;
        hasMore = next.length >= PAGE_SIZE;
        status.textContent = `Live batch API · page ${currentPage}`;
      }
      render();
    } catch (e) {
      hasMore = false;
      status.textContent = "Could not load more from API";
      error.textContent = `${e.message}. The API may restrict browser requests (CORS) or require authorized access.`;
      error.hidden = false;
      render();
    } finally {
      loadingMore = false;
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = "Load more batches";
    }
  }

  async function start() {
    status.textContent = "Checking public batch API…";
    try {
      const firstPage = await fetchApiPage(1);
      batches = firstPage;
      sourceMode = "api";
      currentPage = 1;
      hasMore = firstPage.length >= PAGE_SIZE;
      status.textContent = "Live batch API connected";
      error.hidden = true;
    } catch (apiError) {
      // GitHub Pages cannot proxy cross-origin requests. If the API blocks CORS,
      // use the bundled public batch metadata instead; no secret token is used.
      try {
        const response = await fetch("./data/batches.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not load data/batches.json (HTTP ${response.status})`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("batches.json must contain a JSON array");
        localBatches = data.map(normalizeBatch).filter(Boolean);
        batches = localBatches;
        sourceMode = "local";
        hasMore = false;
        status.textContent = "Using bundled batch data";
        error.textContent = `Live batch API could not be read by this browser (${apiError.message}). Showing the bundled batch list instead. Video/lesson links are not contained in batch metadata.`;
        error.hidden = false;
      } catch (localError) {
        count.textContent = "Batch data unavailable";
        status.textContent = "Load failed";
        error.textContent = `${localError.message}. Make sure index.html, app.js, styles.css, and data/batches.json are uploaded to the repository root.`;
        error.hidden = false;
        return;
      }
    }

    render();
    const batchIdFromUrl = new URLSearchParams(window.location.search).get("batch");
    if (batchIdFromUrl) {
      const selected = batches.find((batch) => safeText(batch.id) === batchIdFromUrl);
      if (selected) openBatch(selected);
      else { input.value = batchIdFromUrl; render(); }
    }
  }

  input.addEventListener("input", render);
  clear.addEventListener("click", () => { input.value = ""; render(); input.focus(); });
  loadMoreButton.addEventListener("click", loadNextPage);
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside = rect.top <= event.clientY && event.clientY <= rect.bottom && rect.left <= event.clientX && event.clientX <= rect.right;
    if (!inside) dialog.close();
  });
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(selectedBatchId);
      copyButton.textContent = "Copied ✓";
      window.setTimeout(() => { copyButton.textContent = "Copy ID"; }, 1500);
    } catch {
      copyButton.textContent = "Select ID to copy";
      const range = document.createRange();
      range.selectNodeContents(dialogId);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  start();
})();
