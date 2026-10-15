(() => {
  const grid = document.getElementById("batchGrid");
  const input = document.getElementById("searchInput");
  const clear = document.getElementById("clearSearch");
  const count = document.getElementById("batchCount");
  const shown = document.getElementById("shownCount");
  const status = document.getElementById("status");
  const empty = document.getElementById("emptyState");
  const error = document.getElementById("errorState");
  let batches = [];

  const safeText = value => String(value ?? "");
  function render() {
    const query = input.value.trim().toLocaleLowerCase();
    const filtered = batches.filter(b => safeText(b.name).toLocaleLowerCase().includes(query));
    grid.replaceChildren();
    filtered.forEach(batch => {
      const card = document.createElement("article");
      card.className = "card";
      const cover = document.createElement("div");
      cover.className = "cover";
      if (batch.imageUrl && /^https?:\/\//i.test(batch.imageUrl)) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = safeText(batch.name);
        img.src = batch.imageUrl;
        img.onerror = () => { img.remove(); const f = document.createElement("span"); f.className = "cover-fallback"; f.textContent = "▧"; cover.append(f); };
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
      id.textContent = batch.id ? "ID " + safeText(batch.id).slice(0, 8) : "Local data";
      meta.append(label, id);
      body.append(title, meta);
      card.append(cover, body);
      grid.append(card);
    });
    shown.textContent = `${filtered.length.toLocaleString()} shown`;
    empty.hidden = filtered.length !== 0;
  }

  async function start() {
    try {
      const response = await fetch("./data/batches.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load data/batches.json (HTTP ${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("batches.json must contain a JSON array.");
      batches = data;
      count.textContent = `${batches.length.toLocaleString()} batches in local data`;
      status.textContent = "Data loaded";
      error.hidden = true;
      render();
    } catch (e) {
      count.textContent = "Batch data unavailable";
      status.textContent = "Load failed";
      error.textContent = `${e.message}. Make sure index.html and the data folder are uploaded to the same GitHub repository.`;
      error.hidden = false;
    }
  }
  input.addEventListener("input", render);
  clear.addEventListener("click", () => { input.value = ""; render(); input.focus(); });
  start();
})();