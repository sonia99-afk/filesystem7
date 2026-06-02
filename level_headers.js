// level_headers.js

(function () {
    if (typeof window === "undefined") return;
  
    window.__levelHeaderNames = window.__levelHeaderNames || Object.create(null);
  
    const MODES = {
      HEADER_ROW: "header-row",
      HEADER_CASCADE: "header-cascade",
      COLUMN_STACK: "column-stack",
      COLUMN_CASCADE: "column-cascade",
    };
  
    const DEFAULTS = {
      enabled: false,
      mode: MODES.HEADER_ROW,
    };
  
    const state = {
      enabled: DEFAULTS.enabled,
      mode: DEFAULTS.mode,
    };
  
    function getToggleBtn() {
      return document.getElementById("toggleLevelHeaders");
    }
  
    function getSettingsBtn() {
      return document.getElementById("levelHeadersSettingsBtn");
    }
  
    function getMenu() {
      return document.getElementById("levelHeadersMenu");
    }
  
    function closeMenu() {
      const menu = getMenu();
      const btn = getSettingsBtn();
  
      menu?.classList.remove("is-open");
      menu?.setAttribute("aria-hidden", "true");
      btn?.classList.remove("is-active");
    }
  
    function toggleMenu() {
      if (!state.enabled) return;
  
      const menu = getMenu();
      const btn = getSettingsBtn();
      if (!menu) return;
  
      const willOpen = !menu.classList.contains("is-open");
  
      menu.classList.toggle("is-open", willOpen);
      menu.setAttribute("aria-hidden", willOpen ? "false" : "true");
      btn?.classList.toggle("is-active", willOpen);
    }
  
    function setEnabled(value) {
      state.enabled = !!value;
  
      if (!state.enabled) closeMenu();
  
      syncToolbar();
  
      if (typeof render === "function") {
        render();
      }
    }
  
    function toggleEnabled() {
      setEnabled(!state.enabled);
    }
  
    function setMode(mode) {
      if (!Object.values(MODES).includes(mode)) return;
  
      state.mode = mode;
      syncToolbar();
  
      if (typeof render === "function") {
        render();
      }
    }
  
    function syncToolbar() {
      const toggleBtn = getToggleBtn();
      const settingsBtn = getSettingsBtn();
      const menu = getMenu();
  
      if (toggleBtn) {
        toggleBtn.classList.toggle("is-active", state.enabled);
        toggleBtn.title = state.enabled
          ? "Скрыть заголовки уровней"
          : "Показать заголовки уровней";
      }
  
      if (settingsBtn) {
        settingsBtn.disabled = !state.enabled;
        settingsBtn.classList.toggle("is-inactive", !state.enabled);
        settingsBtn.title = state.enabled
          ? "Настройки отображения заголовков уровней"
          : "Сначала включите заголовки уровней";
      }
  
      if (menu) {
        menu.querySelectorAll("[data-level-header-mode]").forEach((item) => {
          item.classList.toggle(
            "is-active",
            item.dataset.levelHeaderMode === state.mode
          );
        });
      }
    }
  
    function bindToolbar() {
      const toggleBtn = getToggleBtn();
      const settingsBtn = getSettingsBtn();
      const menu = getMenu();
  
      if (toggleBtn && !toggleBtn.__levelHeadersBound) {
        toggleBtn.__levelHeadersBound = true;
  
        toggleBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleEnabled();
        });
      }
  
      if (settingsBtn && !settingsBtn.__levelHeadersBound) {
        settingsBtn.__levelHeadersBound = true;
  
        settingsBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        });
      }
  
      if (menu && !menu.__levelHeadersBound) {
        menu.__levelHeadersBound = true;
  
        menu.addEventListener("click", (e) => {
          e.stopPropagation();
  
          const item = e.target?.closest?.("[data-level-header-mode]");
          if (!item) return;
  
          setMode(item.dataset.levelHeaderMode);
          closeMenu();
        });
      }
  
      if (!document.__levelHeadersOutsideBound) {
        document.__levelHeadersOutsideBound = true;
  
        document.addEventListener("click", (e) => {
          const tools = document.getElementById("levelHeadersTools");
          if (tools && tools.contains(e.target)) return;
          closeMenu();
        });
      }
  
      syncToolbar();
    }
  
    function setLevelTitle(level, title) {
      window.__levelHeaderNames ||= Object.create(null);
      window.__levelHeaderNames[level] = String(title ?? "");
    }
  
    function getLevelTitle(level) {
      if (window.__levelHeaderNames && level in window.__levelHeaderNames) {
        return window.__levelHeaderNames[level];
      }
  
      return DEFAULT_NAME?.[level] ?? `Уровень ${level}`;
    }
  
    function startLevelTitleEdit(item, level) {
      const input = document.createElement("input");
      input.className = "level-header-edit";
      input.value = getLevelTitle(level);
      input.dataset.level = String(level);
  
      if (!item.classList.contains("level-header-mini-item")) {
        input.style.left = item.style.left;
        input.style.top = item.style.top || "0px";
      }
  
      const editWidth = Math.max(160, input.value.length * 9 + 24);
      input.style.width = `${editWidth}px`;
  
      const oldLeft = parseFloat(item.style.left) || 0;
      const oldWidth = parseFloat(item.style.width) || item.offsetWidth;
      const extra = Math.max(0, editWidth - oldWidth);
  
      const row = item.closest(".level-headers-row");
      if (row && extra > 0) {
        const levelItems = Array.from(row.querySelectorAll(".level-header-item"));
  
        levelItems.forEach((nextItem) => {
          const nextLeft = parseFloat(nextItem.style.left) || 0;
  
          if (nextLeft > oldLeft) {
            nextItem.style.left = `${nextLeft + extra}px`;
          }
        });
      }
  
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("mousedown", (e) => e.stopPropagation());
      input.addEventListener("pointerdown", (e) => e.stopPropagation());
  
      let committed = false;
  
      item.replaceWith(input);
      input.focus();
      input.select();
  
      function commit() {
        if (committed) return;
        committed = true;
        setLevelTitle(level, input.value);
  
        if (typeof render === "function") render();
      }
  
      function cancel() {
        if (committed) return;
        committed = true;
  
        if (typeof render === "function") render();
      }
  
      input.addEventListener("keydown", (e) => {
        e.stopPropagation();
  
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
  
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      });
  
      input.addEventListener("blur", commit);
    }
  
    function getVisibleLevelsForSchema() {
      const displayRoot =
        window.objectFocus?.getFocusedRootNode?.() || root;
  
      const levels = [];
  
      (function walk(node) {
        if (!node) return;
        if (!levels.includes(node.level)) levels.push(node.level);
        (node.children || []).forEach(walk);
      })(displayRoot);
  
      return levels;
    }
  
    function makeEditableLevelItem(level, className) {
      const item = document.createElement("span");
      item.className = className;
      item.dataset.level = String(level);
      item.textContent = getLevelTitle(level);
      item.title = "Клик для переименования";
  
      item.addEventListener("pointerdown", (e) => e.stopPropagation());
      item.addEventListener("mousedown", (e) => e.stopPropagation());
  
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        startLevelTitleEdit(item, level);
      });
  
      return item;
    }
  
    function buildHeaderRowForSchema() {
      if (!state.enabled) return null;
      if (state.mode !== MODES.HEADER_ROW) return null;
      if (currentView !== VIEW.SCHEMA) return null;
  
      const levels = getVisibleLevelsForSchema();
  
      const row = document.createElement("div");
      row.className = "level-headers-row level-headers-row-schema";
  
      levels.forEach((level) => {
        row.appendChild(makeEditableLevelItem(level, "level-header-item"));
      });
  
      return row;
    }
  
    function buildHeaderCascadeForSchema() {
        if (!state.enabled) return null;
        if (state.mode !== MODES.HEADER_CASCADE) return null;
        if (currentView !== VIEW.SCHEMA) return null;
      
        const levels = getVisibleLevelsForSchema();
      
        const wrap = document.createElement("div");
        wrap.className =
          "level-headers-cascade level-headers-cascade-schema";
      
        let currentList = document.createElement("ul");
        currentList.className = "level-header-mini-tree";
      
        wrap.appendChild(currentList);
      
        levels.forEach((level) => {
          const li = document.createElement("li");
          li.className = "level-header-mini-li";
      
          const item = makeEditableLevelItem(
            level,
            "level-header-mini-item"
          );
      
          li.appendChild(item);
      
          const childList = document.createElement("ul");
          childList.className = "level-header-mini-tree";
      
          li.appendChild(childList);
      
          currentList.appendChild(li);
      
          currentList = childList;
        });
      
        return wrap;
    }
  
    function buildColumnStackForSchema() {
        if (!state.enabled) return null;
        if (state.mode !== MODES.COLUMN_STACK) return null;
        if (currentView !== VIEW.SCHEMA) return null;
      
        const displayRoot =
          window.objectFocus?.getFocusedRootNode?.() || root;
      
        const col = document.createElement("div");
        col.className = "level-headers-column level-headers-column-stack";
      
        (function walk(node) {
          if (!node) return;
      
          const item = makeEditableLevelItem(node.level, "level-header-column-item");
          col.appendChild(item);
      
          (node.children || []).forEach(walk);
        })(displayRoot);
      
        return col;
      }

      function buildColumnCascadeForSchema() {
        if (!state.enabled) return null;
        if (state.mode !== MODES.COLUMN_CASCADE) return null;
        if (currentView !== VIEW.SCHEMA) return null;
      
        const displayRoot =
          window.objectFocus?.getFocusedRootNode?.() || root;
      
        const col = document.createElement("div");
        col.className = "level-headers-column level-headers-column-cascade";
      
        let currentList = document.createElement("ul");
        currentList.className = "level-header-mini-tree";
        col.appendChild(currentList);
      
        (function walk(node, list) {
          if (!node) return;
      
          const li = document.createElement("li");
li.className = "level-header-mini-li";

const anchor = document.createElement("span");
anchor.className = "level-header-anchor";
li.appendChild(anchor);

const item = makeEditableLevelItem(node.level, "level-header-mini-item");
li.appendChild(item);
      
          const childList = document.createElement("ul");
          childList.className = "level-header-mini-tree";
childList.dataset.level = String(node.level + 1);
currentList.dataset.level = String(displayRoot.level);
          childList.className = "level-header-mini-tree";
          li.appendChild(childList);
      
          list.appendChild(li);
      
          (node.children || []).forEach((child) => {
            walk(child, childList);
          });
        })(displayRoot, currentList);
      
        return col;
      }

      function layoutColumnCascadeLines() {
        const rootCol = document.querySelector(".level-headers-column-cascade");
        if (!rootCol) return;
      
        rootCol.querySelectorAll(".level-header-trunk, .level-header-plink").forEach((el) => {
          el.remove();
        });
      
        const uls = rootCol.querySelectorAll("ul.level-header-mini-tree[data-level]");
      
        for (const ul of uls) {
          const items = Array.from(ul.children).filter((el) => el.tagName === "LI");
          if (!items.length) continue;
      
          const first = items[0].querySelector(":scope > .level-header-anchor");
          const last = items[items.length - 1].querySelector(":scope > .level-header-anchor");
          if (!first || !last) continue;
      
          const ulBox = ul.getBoundingClientRect();
          const fBox = first.getBoundingClientRect();
          const lBox = last.getBoundingClientRect();
      
          const top = fBox.top - ulBox.top;
          const height = lBox.top - ulBox.top - top;
      
          if (height <= 0) continue;
      
          const trunk = document.createElement("div");
          trunk.className = "level-header-trunk";
          trunk.style.top = `${top}px`;
          trunk.style.height = `${height}px`;
      
          ul.prepend(trunk);
        }
      
        const lis = rootCol.querySelectorAll("li.level-header-mini-li");
      
        for (const li of lis) {
          const childUl = li.querySelector(":scope > ul.level-header-mini-tree[data-level]");
          if (!childUl) continue;
      
          const parentAnchor = li.querySelector(":scope > .level-header-anchor");
          if (!parentAnchor) continue;
      
          const items = Array.from(childUl.children).filter((el) => el.tagName === "LI");
          if (!items.length) continue;
      
          const firstChildAnchor = items[0].querySelector(":scope > .level-header-anchor");
          if (!firstChildAnchor) continue;
      
          const liBox = li.getBoundingClientRect();
          const pBox = parentAnchor.getBoundingClientRect();
          const cBox = firstChildAnchor.getBoundingClientRect();
          const ulBox = childUl.getBoundingClientRect();
      
          const plink = document.createElement("div");
          plink.className = "level-header-plink";
      
          const top = pBox.top - liBox.top + 9;
          const childY = cBox.top - liBox.top;
          const x = ulBox.left - liBox.left;
      
          plink.style.left = `12px`;
          plink.style.top = `${top}px`;
          plink.style.height = `${Math.max(0, childY - top)}px`;
      
          li.appendChild(plink);
        }
      }

    function alignHeaderRowForSchema() {
      const row = document.querySelector(".level-headers-row-schema");
      const tree = document.getElementById("tree");
  
      if (!row || !tree) return;

      if (row.classList.contains("level-headers-cascade")) {
        return;
      }
  
      const items = Array.from(row.querySelectorAll(".level-header-item"));
      const treeRows = Array.from(tree.querySelectorAll("ul li > .row[data-id]"));
  
      if (!items.length || !treeRows.length) return;
  
      const treeBox = tree.getBoundingClientRect();
  
      items.forEach((item) => {
        const level = Number(item.dataset.level);
  
        const matchingRow = treeRows.find((r) => {
          const id = r.dataset.id;
          const found = findWithParent(root, id);
          return found?.node?.level === level;
        });
  
        if (!matchingRow) return;
  
        const box = matchingRow.getBoundingClientRect();
        const left = Math.round(box.left - treeBox.left);
  
        item.style.left = `${left}px`;
  
        if (row.classList.contains("level-headers-cascade")) {
          const index = Number(item.dataset.cascadeIndex || 0);
          item.style.top = `${index * 18}px`;
        }
      });
  
      for (let i = 0; i < items.length; i++) {
        const current = items[i];
        const next = items[i + 1];
  
        const currentLeft = parseFloat(current.style.left) || 0;
        const nextLeft = next ? parseFloat(next.style.left) || 0 : currentLeft + 160;
  
        current.style.width = `${Math.max(24, nextLeft - currentLeft)}px`;
      }
  
      if (row.classList.contains("level-headers-cascade")) {
        row.style.height = `${Math.max(24, items.length * 18 + 6)}px`;
      } else {
        row.style.height = "24px";
      }
    }
  
    function injectStyle() {
      const id = "level-headers-style";
      if (document.getElementById(id)) return;
  
      const st = document.createElement("style");
      st.id = id;
      st.textContent = `
  .level-headers-tools{
    position:relative;
    display:inline-flex;
    align-items:center;
    
  }
  
  .level-headers-tools .btnn{
    margin:0;
  }
  
  .level-headers-toggle{
    border-top-right-radius:0;
    border-bottom-right-radius:0;
  }
  
  .level-headers-settings-btn{
    min-width:31px;
    border-left:none !important;
    border-top-left-radius:0;
    border-bottom-left-radius:0;
    
    line-height:14px;
  }
  
  .level-headers-settings-menu{
    display:none;
    position:absolute;
    left:95%;
    top:12px;
    width:111px;
    z-index:9999;
    border:1px solid #b8b8b8;
    border-radius:6px;
    background:#fff;
    box-shadow:0 4px 18px rgba(0,0,0,.12);
    overflow:hidden;
    
  }
  
  .level-headers-settings-menu.is-open{
    display:block;
  }
  
  .level-headers-settings-title:first-child{
    padding-top:8px;
  }

  .level-headers-settings-title{
    padding-left:10px;
    color:#7a7a7a;
    font-size: 10px;
    font-weight: bold;
  }

  .level-headers-settings-item:last-child{
      margin-bottom:8px;
  }
  
  .level-headers-settings-item{
    display:flex;
    align-items:center;
    gap:8px;
    width:100%;
    border:none;
    background:#fff;
    color:#000;
    padding:7px 10px;
    font:inherit;
    text-align:left;
    cursor:pointer;
  }
  
  .level-headers-settings-item:hover,
  .level-headers-settings-item.is-active{
    background:#e5e5e5;
  }
  
  .level-headers-settings-icon{
    width:14px;
    height:14px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    flex:0 0 14px;
  }
  
  .level-headers-settings-icon::before{
    content:"";
    width:14px;
    height:14px;
    border:1px solid #000;
    border-radius:50%;
    box-sizing:border-box;
  }
  
  .level-headers-settings-item.is-active .level-headers-settings-icon::before{
    background:radial-gradient(circle at center, #5e5e5e 0 52%, transparent 56% 100%);
  }
  
  .level-headers-row{
    position:relative;
    min-height:24px;
    width:100%;
    max-width:100%;
    background:#f4f4f4;
    font-family:inherit;
    
    line-height:1;
    color:#777;
    box-sizing:border-box;
    overflow:hidden;
  }
  
  .level-headers-row-schema{
    margin-bottom:8px;
  }
  
  .level-header-item{
    position:absolute;
    top:0;
    display:block;
    height:24px;
    padding:2px;
    margin:0;
    border:none;
    background:transparent;
    font:inherit;
    color:inherit;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    box-sizing:border-box;
    cursor:text;
  }
  
  .level-header-cascade-item{
    height:18px;
    padding-top:2px;
    padding-bottom:2px;
  }
  
  .level-header-edit{
    position:absolute;
    top:0;
    height:24px;
    width:90px;
    min-width:40px;
    border:none;
    outline:none;
    background:#fff;
    padding:3px 6px;
    font:inherit;
    color:#333;
    box-sizing:border-box;
  }

  .level-headers-cascade{
  background:#f4f4f4;
  margin-bottom:8px;
  
}

.level-header-mini-tree{
  list-style:none;
  margin:0;
  
}

.level-header-mini-tree:first-child{
  padding-left:0;
}

.level-header-mini-li{
  position:relative;
  min-height:18px;
}

.level-header-mini-li::before{
  content:"";
  position:absolute;
  left:-14px;
  top:9px;
  width:14px;
  border-top:1px solid #888;
}



.level-header-mini-tree:first-child > .level-header-mini-li::before{
  display:none;
}

.level-header-mini-item{
  display:inline-block;

  color:#777;
  
  line-height:18px;

  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;

  cursor:text;
  margin-left: 5px;
}

.level-headers-cascade .level-header-edit{
  position:static;
  display:inline-block;
  width:160px;
  height:18px;
  padding:0 4px;
  vertical-align:baseline;
}

.level-headers-column{
  flex:0 0 120px;
  width:120px;
  min-height:100%;
  background:#f4f4f4;
  padding:6px 10px;
  box-sizing:border-box;
  color:#777;
  
  line-height:18px;
}

.level-header-column-item{
  display:block;
  
  padding-bottom: 2px;
  height:18px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  cursor:text;
}

.level-headers-column .level-header-edit{
  position:static;
  display:block;
  width:100%;
  height:18px;
  padding:0 4px;
}

.schema-with-level-column{
  display:flex;
  align-items:flex-start;
  gap:16px;
}

.schema-with-level-column > ul{
  margin-top:0;
}

.level-headers-column{
  flex:0 0 120px;
  width:120px;
  background:#f4f4f4;
  padding:6px 10px;
  box-sizing:border-box;
}

.level-headers-column-cascade{
  width:160px;
  flex:0 0 160px;
  min-height:100%;
  background:#f4f4f4;
  padding:6px 10px;
  box-sizing:border-box;
}

.level-headers-column{
  flex:0 0 auto;
  width:max-content;
  min-width:120px;
  max-width:none;
}

.level-headers-column-cascade{
  flex:0 0 auto;
  width:max-content;
  min-width:160px;
  max-width:none;
}

      .level-headers-column-cascade .level-header-mini-tree{
  list-style:none;
  margin:0;
  padding-left: 0;
  position:relative;
}

.level-headers-column-cascade > .level-header-mini-tree{
  padding-left:0;
}

.level-headers-column-cascade .level-header-mini-li{
  position:relative;
  margin:0;
  padding-left:18px;
  min-height:18px;
}

.level-headers-column-cascade > .level-header-mini-tree > .level-header-mini-li{
  padding-left:0;
}

.level-header-anchor{
  position:absolute;
  top:9px;
  left:0;
  width:0;
  height:0;
  pointer-events:none;
}

.level-header-trunk{
  position:absolute;
  left:0;
  border-left:1px solid #888;
  pointer-events:none;
}

.level-header-plink{
  position:absolute;
  border-left:1px solid #888;
  pointer-events:none;
}

.level-headers-column-cascade .level-header-mini-li::before{
  content:"";
  position:absolute;
  top:9px;
  left:0;
  width:14px;
  border-top:1px solid #888;
}

.level-headers-column-cascade > .level-header-mini-tree > .level-header-mini-li::before{
  display:none;
}

.level-headers-column-cascade{
  font-family:Consolas,"Courier New",monospace;
  font-size:inherit;
  line-height:20px;

  flex:0 0 auto;
  width:max-content;
  min-width:160px;

  background:#f4f4f4;
  padding:0 10px 0 10px;
  box-sizing:border-box;
}

.level-headers-column-cascade .level-header-mini-tree{
  list-style:none;
  margin:0;
  padding-left:31px;
  position:relative;
}

.level-headers-column-cascade > .level-header-mini-tree{
  padding-left:0;
}

.level-headers-column-cascade .level-header-mini-li{
  position:relative;
  margin:0;
  padding-left:0;
  min-height:20px;
  line-height:20px;
}

.level-header-mini-item{
  display:inline-flex;
  align-items:center;
  height:20px;
  line-height:20px;

  color:#777;
  font:inherit;

  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  cursor:text;
}

.level-header-anchor{
  position:absolute;
  top:calc(0.9em - 4px);
  left:0;
  width:0;
  height:0;
  pointer-events:none;
}

.level-header-trunk{
  position:absolute;
  left:calc(12px - 0px);
  border-left:1px solid #888;
  pointer-events:none;
}

.level-header-plink{
  position:absolute;
  left:calc(12px - 3px);
  border-left:1px solid #888;
  pointer-events:none;
}

.level-headers-column-cascade .level-header-mini-li::before{
  content:"";
  position:absolute;
  top:calc(0.9em - 4px);
  left:calc(12px - 3px - 28px);
  width:16px;
  border-top:1px solid #888;
}

.level-headers-column-cascade > .level-header-mini-tree > .level-header-mini-li::before{
  display:none;
}





.level-headers-cascade .level-header-mini-li > .level-header-mini-tree{
  position:relative;
  padding-left:28px;
}

.level-headers-cascade .level-header-mini-li:has(> .level-header-mini-tree > .level-header-mini-li) > .level-header-mini-tree::before{
  content:"";
  position:absolute;
  left:14px;
  
  height:9px;
  border-left:1px solid #888;
}

.level-headers-cascade > .level-header-mini-tree::before{
  display:none;
}
  
  `;
      document.head.appendChild(st);
    }
  
    function init() {
      injectStyle();
      bindToolbar();
    }
  
    window.levelHeaders = {
      MODES,
      buildHeaderRowForSchema,
      buildHeaderCascadeForSchema,
      alignHeaderRowForSchema,
      buildColumnStackForSchema,
      buildColumnCascadeForSchema,
      layoutColumnCascadeLines,
  
      getState() {
        return { ...state };
      },
  
      isEnabled() {
        return !!state.enabled;
      },
  
      getMode() {
        return state.mode;
      },
  
      getLevelTitle,
      setLevelTitle,
  
      setEnabled,
      setMode,
      refresh: syncToolbar,
    };
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();