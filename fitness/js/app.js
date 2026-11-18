(() => {
  const D = window.EXERCISE_DATA;
  const M = window.MUSCLES;
  const EX = D.exercises;
  const byId = Object.fromEntries(EX.map((e) => [e.id, e]));
  const partName = Object.fromEntries(D.parts.map((p) => [p.id, p.zh]));
  const eqName = Object.fromEntries(D.equipment.map((q) => [q.id, q.zh]));
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const state = { part: "all", eq: "all", q: "", muscle: null };

  // 圖片：images/<id>.png 存在就顯示（GPT 生成），否則以肌肉圖代替
  const imgPath = (e) => `images/${e.id}.png`;
  const animPath = (e) => `images/${e.id}.mp4`;

  /* ---------- 視圖切換 ---------- */
  document.querySelectorAll(".views button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".views button").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelectorAll(".view").forEach((v) => (v.hidden = v.id !== "view-" + b.dataset.view));
    })
  );

  /* ---------- 動作列表 ---------- */
  function chips(el, items, key) {
    const count = (id) => EX.filter((e) => id === "all" || e[key === "part" ? "part" : "eq"] === id).length;
    el.innerHTML = [{ id: "all", zh: "全部" }, ...items]
      .map((i) => `<button class="chip${state[key] === i.id ? " on" : ""}" data-id="${i.id}">${i.zh}<span class="n">${count(i.id)}</span></button>`)
      .join("");
    el.onclick = (ev) => {
      const b = ev.target.closest(".chip");
      if (!b) return;
      state[key] = b.dataset.id;
      renderList();
    };
  }

  const matches = (e) => {
    if (state.part !== "all" && e.part !== state.part) return false;
    if (state.eq !== "all" && e.eq !== state.eq) return false;
    if (!state.q) return true;
    const q = state.q.toLowerCase();
    const muscleText = [...e.primary, ...e.secondary].map((m) => M[m].zh + M[m].en).join(" ");
    return (e.zh + e.en + muscleText + D.patterns[e.pattern].zh).toLowerCase().includes(q);
  };

  function card(e) {
    return `<button class="card" data-ex="${e.id}">
      <div class="thumb">
        <img src="${imgPath(e)}" alt="${esc(e.zh)}" loading="lazy" onerror="this.remove()">
        <div class="mini">${bodySVG("front", e)}${bodySVG("back", e)}</div>
        <span class="ph">姿勢圖待生成</span>
      </div>
      <div class="card-body">
        <b>${esc(e.zh)}</b><span class="en">${esc(e.en)}</span>
        <div class="tags"><span class="tag eq">${eqName[e.eq]}</span>${e.primary.map((m) => `<span class="tag">${M[m].zh.split("（")[0]}</span>`).join("")}</div>
      </div>
    </button>`;
  }

  function renderList() {
    chips($("#part-chips"), D.parts, "part");
    chips($("#eq-chips"), D.equipment, "eq");
    const parts = state.part === "all" ? D.parts : D.parts.filter((p) => p.id === state.part);
    let html = "";
    for (const p of parts) {
      const inPart = EX.filter((e) => e.part === p.id && matches(e));
      if (!inPart.length) continue;
      html += `<div class="group"><h2>${p.zh}<span class="tag eq">${inPart.length} 個動作</span></h2>`;
      for (const q of D.equipment) {
        const items = inPart.filter((e) => e.eq === q.id);
        if (items.length) html += `<h3>${q.zh}</h3><div class="grid">${items.map(card).join("")}</div>`;
      }
      html += "</div>";
    }
    $("#list").innerHTML = html || `<p class="hint">找不到符合的動作。</p>`;
  }

  $("#q").addEventListener("input", (ev) => {
    state.q = ev.target.value.trim();
    renderList();
  });
  document.addEventListener("click", (ev) => {
    const c = ev.target.closest("[data-ex]");
    if (c) openDetail(byId[c.dataset.ex]);
  });

  /* ---------- 詳細頁 ---------- */
  const legend = `<div class="legend"><span><i style="background:var(--primary)"></i>主動肌</span><span><i style="background:var(--secondary)"></i>協同肌</span><span><i style="background:var(--idle);outline:2px solid var(--stab)"></i>穩定肌</span></div>`;
  const roleBlock = (cls, title, desc, list) =>
    list.length ? `<div class="role ${cls}"><b>${title}</b><small>${desc}</small>${list.map((m) => M[m].zh).join("、")}</div>` : "";

  function openDetail(e) {
    const dlg = $("#detail");
    dlg.innerHTML = `
      <div class="d-head">
        <div><h2>${esc(e.zh)}</h2><div class="en">${esc(e.en)}｜${partName[e.part]}｜${eqName[e.eq]}｜動作模式：${D.patterns[e.pattern].zh}</div></div>
        <button class="close" aria-label="關閉">✕</button>
      </div>
      <div class="d-body">
        <div class="media">
          <div class="media-box"><img src="${imgPath(e)}" alt="${esc(e.zh)} 姿勢圖" onerror="this.replaceWith(document.createTextNode('姿勢圖：執行 scripts/generate_images.py 以 GPT 生成後顯示'))"></div>
          <div class="media-box"><video src="${animPath(e)}" autoplay loop muted playsinline onerror="this.replaceWith(document.createTextNode('動作動畫：之後以 ComfyUI 製作（images/${e.id}.mp4）'))"></video></div>
        </div>
        <div class="anatomy">
          <div><div class="maps">${bodySVG("front", e)}${bodySVG("back", e)}</div>${legend}</div>
          <div class="roles">
            ${roleBlock("", "主動肌（主要發力）", "動作的主要力量來源", e.primary)}
            ${roleBlock("sec", "協同肌（輔助發力）", "協助主動肌完成動作", e.secondary)}
            ${roleBlock("stab", "穩定肌（等長收縮）", "維持姿勢與關節穩定", e.stabilizers)}
          </div>
        </div>
        <div><h3>動作步驟</h3><ol>${e.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
        <div><h3>各階段肌肉發力</h3><ul class="force">${e.force.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
        <div><h3>常見錯誤</h3><ul class="mistakes">${e.mistakes.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
        <div class="d-refs">參考：${e.refs.map((r) => esc(D.books[r])).join("；")}</div>
      </div>`;
    dlg.querySelector(".close").onclick = () => dlg.close();
    dlg.onclick = (ev) => { if (ev.target === dlg) dlg.close(); };
    dlg.showModal();
    dlg.scrollTop = 0;
  }

  /* ---------- 依肌肉查 ---------- */
  function renderMuscles() {
    const sel = state.muscle;
    const hl = sel ? { primary: [sel] } : {};
    $("#muscle-maps").innerHTML = bodySVG("front", hl, { interactive: true, selected: sel }) + bodySVG("back", hl, { interactive: true, selected: sel });
    if (!sel) {
      $("#muscle-result").innerHTML = `<p class="hint">尚未選擇肌肉。</p>`;
      return;
    }
    const prim = EX.filter((e) => e.primary.includes(sel));
    const sec = EX.filter((e) => e.secondary.includes(sel));
    const pats = Object.values(D.patterns).filter((p) => p.muscles.includes(sel)).map((p) => p.zh);
    $("#muscle-result").innerHTML = `
      <h2 style="margin:0 0 4px">${M[sel].zh}</h2>
      <p class="hint" style="margin:0 0 12px">${M[sel].en}${pats.length ? "｜相關動作模式：" + pats.join("、") : ""}</p>
      <div class="group"><h3>主要訓練動作（${prim.length}）</h3><div class="grid">${prim.map(card).join("") || "—"}</div></div>
      <div class="group"><h3>輔助參與的動作（${sec.length}）</h3><div class="grid">${sec.map(card).join("") || "—"}</div></div>`;
  }
  $("#muscle-maps").addEventListener("click", (ev) => {
    const p = ev.target.closest("[data-muscle]");
    if (!p) return;
    state.muscle = p.dataset.muscle;
    renderMuscles();
  });
  $("#muscle-maps").addEventListener("keydown", (ev) => {
    if ((ev.key === "Enter" || ev.key === " ") && ev.target.dataset.muscle) {
      ev.preventDefault();
      state.muscle = ev.target.dataset.muscle;
      renderMuscles();
    }
  });

  /* ---------- 動作模式對照 ---------- */
  function renderPatterns() {
    const rows = Object.entries(D.patterns)
      .map(([id, p]) => {
        const list = EX.filter((e) => e.pattern === id);
        if (!list.length) return "";
        return `<tr><td><b>${p.zh}</b></td><td>${p.muscles.map((m) => M[m].zh).join("、")}</td>
          <td>${list.map((e) => `<button class="link" data-ex="${e.id}">${e.zh}</button>`).join("、")}</td></tr>`;
      })
      .join("");
    $("#pattern-table").innerHTML = `<div class="table-wrap"><table><thead><tr><th>動作模式</th><th>主要肌群</th><th>代表動作</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  $("#book-list").innerHTML = Object.values(D.books).map((b) => `<li>${esc(b)}</li>`).join("");
  renderList();
  renderMuscles();
  renderPatterns();
})();
