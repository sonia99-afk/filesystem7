// mark_property.js
// Свойство объекта "Отметка":
// - состояние объекта: не отмечено / отмечено
// - глобальное отображение кружков
// - меню настроек: Скрыть/Показать и Зачеркнуть/Не зачёркивать

(function () {
  if (typeof window === "undefined") return;

  window.__markMap = window.__markMap || Object.create(null);

  window.__markHiddenMap = window.__markHiddenMap || Object.create(null);

const hideTimers = Object.create(null);
const HIDE_DELAY_MS = 2500;

  const DEFAULTS = {
    showMarks: false,
    hideMarked: false,
    strikeMarked: false,
  };

  const state = {
    showMarks: DEFAULTS.showMarks,
    hideMarked: DEFAULTS.hideMarked,
    strikeMarked: DEFAULTS.strikeMarked,
  };

  function host() {
    return document.getElementById("tree");
  }

  function isEditingNow() {
    const ae = document.activeElement;
    if (!ae) return false;
    if (ae.tagName === "INPUT" && ae.classList?.contains("edit")) return true;
    if (ae.tagName === "TEXTAREA" && ae.classList?.contains("tg-export")) return true;
    if (ae.isContentEditable) return true;
    return false;
  }

  function isMarked(id) {
    return !!(id && window.__markMap && window.__markMap[id]);
  }

  function setMarked(id, value, withHistory = true) {
    if (!id) return false;

    const next = !!value;
    const prev = isMarked(id);
    if (prev === next) return false;

    if (withHistory && typeof pushHistory === "function") {
      pushHistory();
    }

    window.__markMap ||= Object.create(null);

    if (next) window.__markMap[id] = true;
    else delete window.__markMap[id];

    decorateAllRows();
    return true;
  }

  function toggleMarked(id) {
    if (!id) return false;
    return setMarked(id, !isMarked(id), true);
  }

  function clearHideTimer(id) {
    if (hideTimers[id]) {
      clearTimeout(hideTimers[id]);
      delete hideTimers[id];
    }
  }
  
  function clearHiddenState(id) {
    clearHideTimer(id);
  
    if (window.__markHiddenMap) {
      delete window.__markHiddenMap[id];
    }
  }
  
  function scheduleHide(id) {
    if (!id) return;
    if (!state.hideMarked) return;
    if (!isMarked(id)) return;
  
    if (window.__markHiddenMap[id]) return;
    if (hideTimers[id]) return;
  
    hideTimers[id] = setTimeout(() => {
      delete hideTimers[id];
  
      window.__markHiddenMap[id] = true;
  
      decorateAllRows();
    }, HIDE_DELAY_MS);
  }
  
  function clearAllHidden() {
    Object.keys(hideTimers).forEach(clearHideTimer);
    window.__markHiddenMap = Object.create(null);
  }

  function buildMarkDot(id) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "mark-dot" + (isMarked(id) ? " is-marked" : "");
    dot.dataset.markDot = "1";
    dot.dataset.id = id;
    dot.title = isMarked(id) ? "Отмечено" : "Не отмечено";
    dot.setAttribute("aria-label", dot.title);

    dot.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    dot.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    dot.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (typeof isTreeLocked === "function" && isTreeLocked()) return;
      if (isEditingNow()) return;

      if (typeof selectedId !== "undefined") selectedId = id;
      if (typeof treeHasFocus !== "undefined") treeHasFocus = true;

      toggleMarked(id);

      if (typeof render === "function") render();
    });

    return dot;
  }

  function decorateRow(row) {
    if (!row || !row.dataset?.id) return;

    row.querySelector(":scope > .mark-dot")?.remove();

    const marked = isMarked(row.dataset.id);
    const shouldStrike = state.strikeMarked && marked;

    const shouldHide = state.hideMarked && marked;
const isHidden = !!window.__markHiddenMap[row.dataset.id];

    row.classList.toggle("mark-row", !!state.showMarks);
    row.classList.toggle("is-marked-object", marked);
    row.classList.toggle("mark-strike-object", shouldStrike);

    const li = row.closest("li");
    const caps = li?.querySelector(":scope > .captions");

    if (caps) {
      caps.classList.toggle("mark-strike-object", shouldStrike);
    }

    if (shouldHide) {
      scheduleHide(row.dataset.id);
    } else {
      clearHiddenState(row.dataset.id);
    }
    
    if (li) {
      li.classList.toggle("mark-hidden-object", isHidden);
    }

    if (!state.showMarks) return;

    const dot = buildMarkDot(row.dataset.id);
    row.insertBefore(dot, row.firstChild);
  }

  function decorateAllRows() {
    const h = host();
    if (!h) return;

    h.querySelectorAll(".row[data-id]").forEach((row) => {
      if (row.closest(".structure-table")) return;

      if (
        row.classList.contains("hierarchy-node") ||
        row.classList.contains("hierarchy-horizontal-node") ||
        row.classList.contains("icicle-horizontal-node") ||
        row.classList.contains("icicle-vertical-node") ||
        row.classList.contains("leaf-node")
      ) {
        return;
      }

      decorateRow(row);
    });

    h.querySelectorAll(".structure-table .row[data-id]").forEach((row) => {
      const marked = isMarked(row.dataset.id);
      const shouldStrike = state.strikeMarked && marked;

      const shouldHide = state.hideMarked && marked;
const isHidden = !!window.__markHiddenMap[row.dataset.id];

      row.classList.toggle("is-marked-object", marked);
      row.classList.toggle("mark-strike-object", shouldStrike);

      const tr = row.closest("tr");

      if (tr) {
        tr.classList.toggle("is-marked-object", marked);
        tr.classList.toggle("mark-strike-object", shouldStrike);

        tr.classList.toggle("mark-hidden-object", isHidden);
      }

      if (shouldHide) {
        scheduleHide(row.dataset.id);
      } else {
        clearHiddenState(row.dataset.id);
      }
    });

    requestAnimationFrame(() => {
      if (typeof layoutTrunks === "function") layoutTrunks();
      relayoutTrunksIgnoringHidden();
    });

    syncToolbar();
  }

  function setShowMarks(value) {
    const next = !!value;
    if (state.showMarks === next) return;
  
    state.showMarks = next;
    closeSettingsMenu();
    decorateAllRows();
  
    requestAnimationFrame(() => {
      if (typeof layoutTrunks === "function") {
        layoutTrunks();
      }
    });
  }

  function toggleShowMarks() {
    setShowMarks(!state.showMarks);
  }

  function toggleHideMarked() {
    state.hideMarked = !state.hideMarked;
  
    if (!state.hideMarked) {
      clearAllHidden();
    }
  
    decorateAllRows();
  }

  function toggleStrikeMarked() {
    state.strikeMarked = !state.strikeMarked;
    decorateAllRows();
  }

  function setMode(mode) {
    if (mode === "hide") {
      state.hideMarked = true;
      syncToolbar();
      return;
    }

    if (mode === "show") {
      state.hideMarked = false;
      syncToolbar();
      return;
    }

    if (mode === "strike") {
      state.strikeMarked = true;
      decorateAllRows();
      return;
    }

    if (mode === "unstrike") {
      state.strikeMarked = false;
      decorateAllRows();
    }
  }

  function getToggleBtn() {
    return document.getElementById("toggleMarks");
  }

  function getSettingsBtn() {
    return document.getElementById("markSettingsBtn");
  }

  function getSettingsMenu() {
    return document.getElementById("markSettingsMenu");
  }

  function closeSettingsMenu() {
    const menu = getSettingsMenu();
    const btn = getSettingsBtn();

    menu?.classList.remove("is-open");
    menu?.setAttribute("aria-hidden", "true");
    btn?.classList.remove("is-active");
  }

  function toggleSettingsMenu() {
    if (!state.showMarks) return;

    const menu = getSettingsMenu();
    const btn = getSettingsBtn();
    if (!menu) return;

    const willOpen = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", willOpen);
    menu.setAttribute("aria-hidden", willOpen ? "false" : "true");
    btn?.classList.toggle("is-active", willOpen);
  }

  function setItemText(item, text) {
    if (!item) return;

    const textEl = item.querySelector(".mark-settings-text");
    if (textEl) {
      textEl.textContent = text;
      return;
    }

    const spans = item.querySelectorAll("span");
    if (spans.length >= 2) {
      spans[1].textContent = text;
      return;
    }

    item.textContent = text;
  }

  function setItemIcon(item, iconHtml) {
    const iconEl = item.querySelector(".mark-settings-icon");
    if (iconEl) iconEl.innerHTML = iconHtml;
  }

  function syncToolbar() {
    const toggleBtn = getToggleBtn();
    const settingsBtn = getSettingsBtn();
    const menu = getSettingsMenu();

    if (toggleBtn) {
      toggleBtn.classList.toggle("is-active", state.showMarks);
      toggleBtn.title = state.showMarks ? "Скрыть отметки" : "Показать отметки";
    }

    if (settingsBtn) {
      settingsBtn.disabled = !state.showMarks;
      settingsBtn.classList.toggle("is-inactive", !state.showMarks);
      settingsBtn.title = state.showMarks
        ? "Настройки отображения отмеченных объектов"
        : "Сначала включите отметки";
    }

    if (menu) {
      const hideItem = menu.querySelector('[data-mark-mode="hide"]');
      const strikeItem = menu.querySelector('[data-mark-mode="strike"]');

      if (hideItem) {
        hideItem.classList.toggle("is-active", state.hideMarked);
        setItemText(hideItem, state.hideMarked ? "Показать" : "Скрыть");
        setItemIcon(
          hideItem,
          state.hideMarked
            ? '<img src="icons/Показать.png" width="14" height="14">'
            : '<img src="icons/Скрыть.png" width="14" height="14">'
        );
      }

      if (strikeItem) {
        strikeItem.classList.toggle("is-active", state.strikeMarked);
      
        setItemText(
          strikeItem,
          state.strikeMarked ? "Не зачёркивать" : "Зачеркнуть"
        );
      
        setItemIcon(
          strikeItem,
          state.strikeMarked
            ? '<img class="mark-settings-img" src="icons/Текст.png" width="14" height="14">'
            : '<img class="mark-settings-img" src="icons/Зачеркнутный.png" width="14" height="14">'
        );
      }
    }
  }

  function bindToolbar() {
    const toggleBtn = getToggleBtn();
    const settingsBtn = getSettingsBtn();
    const menu = getSettingsMenu();

    if (toggleBtn && !toggleBtn.__markBound) {
      toggleBtn.__markBound = true;
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleShowMarks();
      });
    }

    if (settingsBtn && !settingsBtn.__markBound) {
      settingsBtn.__markBound = true;
      settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsMenu();
      });
    }

    if (menu && !menu.__markBound) {
      menu.__markBound = true;

      menu.addEventListener("click", (e) => {
        e.stopPropagation();

        const item = e.target?.closest?.("[data-mark-mode]");
        if (!item) return;

        const action = item.dataset.markMode;

        if (action === "hide") toggleHideMarked();
        if (action === "strike") toggleStrikeMarked();

        closeSettingsMenu();
      });
    }

    if (!document.__markOutsideBound) {
      document.__markOutsideBound = true;
      document.addEventListener("click", (e) => {
        const tools = document.getElementById("markTools");
        if (tools && tools.contains(e.target)) return;
        closeSettingsMenu();
      });
    }

    syncToolbar();
  }

  function relayoutTrunksIgnoringHidden() {
    const h = host();
    if (!h) return;
  
    h.querySelectorAll("ul").forEach((ul) => {
      const trunk = ul.querySelector(":scope > .trunk");
      if (!trunk) return;
  
      const rows = Array.from(ul.children)
        .filter((el) => el.tagName === "LI")
        .filter((li) => !li.classList.contains("mark-hidden-object"))
        .map((li) => li.querySelector(":scope > .row"))
        .filter(Boolean);
  
      if (rows.length <= 1) {
        trunk.style.height = "0px";
        return;
      }
  
      const ulRect = ul.getBoundingClientRect();
      const firstRect = rows[0].getBoundingClientRect();
      const lastRect = rows[rows.length - 1].getBoundingClientRect();
  
      const top = firstRect.top - ulRect.top + firstRect.height / 2;
      const bottom = lastRect.top - ulRect.top + lastRect.height / 2;
  
      trunk.style.top = `${top}px`;
      trunk.style.height = `${Math.max(0, bottom - top)}px`;
    });
  }

  function injectStyle() {
    const id = "mark-property-style";
    if (document.getElementById(id)) return;

    const st = document.createElement("style");
    st.id = id;
    st.textContent = `
.mark-tools{
  position:relative;
  display:inline-flex;
  align-items:center;
  margin-left:21px;
  margin-right:21px;
}
.mark-tools .btnn{
  margin:0;
}
.mark-toggle{
  border-top-right-radius:0;
  border-bottom-right-radius:0;
}
.mark-settings-btn{
  min-width:31px;
  border-left:none !important;
  border-top-left-radius:0;
  border-bottom-left-radius:0;
  font-size:14px;
  line-height:14px;
}
.mark-settings-menu{
  display:none;
  position:absolute;
  left:95%;
  top:12px;
  width:161px;
  z-index:9999;
  border:1px solid #b8b8b8;
  border-radius:9px;
  background:#fff;
  box-shadow:0 4px 18px rgba(0,0,0,.12);
  overflow:hidden;
  
  font-size:12px;
}
.mark-settings-menu.is-open{
  display:block;
}
.mark-settings-title{
  padding-top:8px;
  padding-left:16px;
  height:16px;
  color:#7a7a7a;
  font-weight:700;
  font-size:10px;
}
.mark-settings-item{
  padding-bottom:0;
  padding-top:0;
  display:flex;
  align-items:center;
  width:100%;
  border:none;
  background:#fff;
  color:#000;
  height:28px;
  font:inherit;
  text-align:left;
  cursor:pointer;
  padding-left:16px;
}

.mark-settings-item:last-child{
    margin-bottom:8px;
    
}


.mark-settings-item:hover,
.mark-settings-item.is-active{
  background:#e5e5e5;
}
.mark-settings-icon{
  width:32px;
  display:inline-flex;
  justify-content:center;
  align-items:center;
  color:#666;
}
.mark-settings-item[data-mark-mode="strike"] .mark-settings-icon{
  font-family:Georgia, serif;
}
.mark-dot{
  width:14px;
  height:14px;
  flex:0 0 14px;
  display:inline-block;
  box-sizing:border-box;
  padding:0;
  margin:0px 7px 0 0;
  border:1px solid #000;
  border-radius:50%;
  background:transparent;
  cursor:pointer;
  vertical-align:middle;
}
.mark-dot.is-marked{
  background:radial-gradient(circle at center, #5e5e5e 0 52%, transparent 56% 100%);
}
.row .mark-dot:hover{
  box-shadow:0 0 0 2px rgba(0,0,0,.10);
}
.hierarchy-node .mark-dot,
.hierarchy-horizontal-node .mark-dot,
.icicle-horizontal-node .mark-dot,
.icicle-vertical-node .mark-dot,
.leaf-node .mark-dot{
  margin-right:6px;
}
.structure-table .mark-dot{
  margin-left:2px;
}

#tree .row.is-marked-object .label{
  opacity:0.5;
}

#tree .row.mark-strike-object .label,
#tree .row.mark-strike-object .ordinal-badge,
#tree .captions.mark-strike-object .caption{
  text-decoration:line-through;
}

#tree .row.mark-strike-object .edit,
#tree .captions.mark-strike-object .edit{
  text-decoration:none;
}

.structure-table tr.mark-strike-object td:not(.table-mark-cell){
  text-decoration:line-through;
}

.structure-table tr.mark-strike-object .mark-dot{
  text-decoration:none;
}

#tree li.mark-hidden-object{
  height:0 !important;
  min-height:0 !important;
  margin:0 !important;
  padding:0 !important;
  overflow:hidden !important;
}

#tree li.mark-hidden-object::before{
  display:none !important;
}

#tree li.mark-hidden-object > .row,
#tree li.mark-hidden-object > .captions,
#tree li.mark-hidden-object > ul{
  display:none !important;
}

.structure-table tr.mark-hidden-object{
  display:none;
}

.row.mark-row.is-marked-object > .ordinal-badge,
.row.mark-row.is-marked-object > .label{
    opacity: 0.5;
}

.row.mark-row.is-marked-object + .captions .caption{
  opacity:0.5;
}


`;
    document.head.appendChild(st);
  }

  if (typeof window.snapshot === "function" && !window.snapshot.__markPatched) {
    const _snapshot = window.snapshot;

    window.snapshot = function patchedSnapshotWithMarks() {
      const raw = _snapshot();
      const data = JSON.parse(raw);

      data.__markMap = { ...(window.__markMap || {}) };
      data.__markState = { ...state };

      return JSON.stringify(data);
    };

    window.snapshot.__markPatched = true;
  }

  if (typeof window.restore === "function" && !window.restore.__markPatched) {
    const _restore = window.restore;

    window.restore = function patchedRestoreWithMarks(saved) {
      try {
        const data = JSON.parse(saved);

        window.__markMap = data.__markMap || Object.create(null);

        if (data.__markState) {
          state.showMarks = !!data.__markState.showMarks;
          state.hideMarked = !!data.__markState.hideMarked;
          state.strikeMarked = !!data.__markState.strikeMarked;

          if (data.__markState.mode === "hide") state.hideMarked = true;
          if (data.__markState.mode === "strike") state.strikeMarked = true;
        }
      } catch (_) {
        window.__markMap = Object.create(null);
      }

      _restore(saved);
      requestAnimationFrame(decorateAllRows);
    };

    window.restore.__markPatched = true;
  }

  if (typeof window.render === "function" && !window.render.__markPatched) {
    const _render = window.render;

    window.render = function patchedRenderWithMarks() {
      _render();
      requestAnimationFrame(decorateAllRows);
    };

    window.render.__markPatched = true;
  }

  function init() {
    injectStyle();
    bindToolbar();
    requestAnimationFrame(decorateAllRows);
  }

  window.markProperty = {
    isMarked,
    setMarked,
    toggleMarked,
    buildMarkDot,

    getState() {
      return { ...state };
    },

    setShowMarks,
    setMode,

    setHideMarked(value) {
      state.hideMarked = !!value;
      syncToolbar();
    },

    setStrikeMarked(value) {
      state.strikeMarked = !!value;
      decorateAllRows();
    },

    refresh: decorateAllRows,

    getMap() {
      return { ...(window.__markMap || {}) };
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();