// table_multi_select_tree.js
// Мультивыделение объектов в таблице по дереву через клавиатурные хоткеи.
// Первый этап:
// - rangeUp / rangeDown
// - выделяем строки таблицы, а не отдельные ячейки
// - работаем отдельно от старого multi_select_patch.js
// - не трогаем обычное мультивыделение в структуре

(function () {
  if (typeof window === "undefined") return;

  const OWNER = "table-tree";
  const STYLE_ID = "table-multi-select-tree-style";

  const state = {
    anchorId: null,
    activeId: null,
    contextKey: null,
    ids: new Set(),
  };

  function isTableViewActive() {
    const host = document.getElementById("tree");

    return (
      !!host?.querySelector?.(".structure-table") &&
      (!window.VIEW || window.currentView === window.VIEW.TABLE)
    );
  }

  function host() {
    return document.getElementById("tree");
  }

  function cssEscapeLocal(value) {
    const s = String(value || "");

    if (window.CSS && typeof CSS.escape === "function") {
      return CSS.escape(s);
    }

    return s.replace(/[^a-zA-Z0-9_\-]/g, "\\$&");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      .structure-table tbody tr.table-row-multi > td,
      .structure-table tbody tr.table-row-multi > td.table-cell {
        background: rgba(128, 128, 128, 0.14) !important;
      }

      .structure-table tbody tr.table-row-multi-anchor > td,
      .structure-table tbody tr.table-row-multi-anchor > td.table-cell {
        background: rgba(128, 128, 128, 0.20) !important;
      }

      /* Синий контур строки начала мультивыделения */
      .structure-table tbody tr.table-row-multi-anchor {
        outline: 2px solid rgba(37, 99, 235, 0.9);
        outline-offset: -2px;
        position: relative;
        z-index: 2;
      }

      /*
        Черный бордер активной ячейки НЕ убираем.
        Он должен оставаться поверх серого фона и синего контура строки.
      */
      .structure-table tbody tr.table-row-multi > td.table-cell-selected,
      .structure-table tbody tr.table-row-multi-anchor > td.table-cell-selected {
        position: relative;
        z-index: 4;
      }

      .structure-table tbody tr.table-row-multi .row,
      .structure-table tbody tr.table-row-multi-anchor .row {
        background: transparent !important;
        color: inherit !important;
      }

      .structure-table tbody tr.table-row-multi .row *,
      .structure-table tbody tr.table-row-multi-anchor .row * {
        background: transparent !important;
        color: inherit !important;
      }
    `;

    document.head.appendChild(style);
  }

  function isEditingNow() {
    const ae = document.activeElement;
    if (!ae) return false;

    const tag = (ae.tagName || "").toLowerCase();

    if (tag === "input") return true;
    if (tag === "textarea") return true;
    if (tag === "select") return true;
    if (ae.isContentEditable) return true;

    if (ae.closest?.(".table-cell-editor")) return true;
    if (ae.closest?.(".table-rich-cell-editor")) return true;
    if (ae.closest?.(".table-dropdown-menu")) return true;
    if (ae.closest?.(".table-tag-compact-menu")) return true;

    return false;
  }

  function getNodeById(id) {
    if (!id || typeof findWithParent !== "function") return null;

    return findWithParent(root, id);
  }

  function getSelectedRowId() {
    const h = host();
    if (!h) return "";

    const selectedCell = h.querySelector("td.table-cell-selected");

    if (selectedCell?.dataset?.rowId) {
      return selectedCell.dataset.rowId;
    }

    if (window.selectedId) {
      return window.selectedId;
    }

    const selectedRow = h.querySelector(".row.sel[data-id]");

    if (selectedRow?.dataset?.id) {
      return selectedRow.dataset.id;
    }

    return "";
  }

  function rowById(id) {
    const h = host();
    if (!h || !id) return null;

    return h.querySelector(`.row[data-id="${cssEscapeLocal(id)}"]`);
  }

  function trById(id) {
    return rowById(id)?.closest?.("tr") || null;
  }

  function contextKeyForId(id) {
    const found = getNodeById(id);

    if (!found?.node) return null;

    // Пока повторяем старую логику обычного rangeUp/rangeDown:
    // мультивыделение идёт внутри одного уровня.
    return String(found.node.level);
  }

  function tableRowsBySameLevel(id) {
    const h = host();
    if (!h || !id) return [];

    const found = getNodeById(id);
    if (!found?.node) return [];

    const targetLevel = found.node.level;

    return Array.from(h.querySelectorAll(".structure-table tbody tr")).filter(
      (tr) => {
        const row = tr.querySelector(".row[data-id]");
        const rowId = row?.dataset?.id;

        if (!rowId) return false;

        const info = getNodeById(rowId);

        return !!info?.node && info.node.level === targetLevel;
      }
    );
  }

  function getRowIdFromTr(tr) {
  return tr?.querySelector?.(".row[data-id]")?.dataset?.id || "";
}

function tableRowsAllVisible() {
  const h = host();
  if (!h) return [];

  return Array.from(h.querySelectorAll(".structure-table tbody tr")).filter(
    (tr) => !!getRowIdFromTr(tr)
  );
}

function clearOtherTableSelections() {
  window.tableMultiSelectDeep?.clear?.();
  window.tableMultiSelectBranch?.clear?.();
}

function clearTableMultiClasses() {
  const h = host();
  if (!h) return;

  /*
    В таблице больше не используем .row.multi / .row.multi-anchor
    как визуальное выделение, потому что это классы обычной структуры.
    Но старые следы всё равно чистим.
  */
  h.querySelectorAll(".structure-table .row.multi, .structure-table .row.multi-anchor").forEach((row) => {
    row.classList.remove("multi");
    row.classList.remove("multi-anchor");
    row.removeAttribute("data-multi-owner");
  });

  h.querySelectorAll(".structure-table tbody tr").forEach((tr) => {
    tr.classList.remove("table-row-multi");
    tr.classList.remove("table-row-multi-anchor");
  });
}

function applyClasses() {
  if (!isTableViewActive()) return;

  clearTableMultiClasses();

  for (const id of state.ids) {
    const tr = trById(id);

    if (!tr) continue;

    tr.classList.add("table-row-multi");

    if (id === state.anchorId) {
      tr.classList.add("table-row-multi-anchor");
    }
  }
}

  function reset() {
    state.anchorId = null;
    state.activeId = null;
    state.contextKey = null;
    state.ids.clear();

    clearTableMultiClasses();
  }

  function setRange(anchorId, activeId) {
    const anchorTr = trById(anchorId);
    const activeTr = trById(activeId);

    if (!anchorTr || !activeTr) return false;

    const anchorCtx = contextKeyForId(anchorId);
    const activeCtx = contextKeyForId(activeId);

    if (!anchorCtx || !activeCtx || anchorCtx !== activeCtx) return false;

    const rows = tableRowsBySameLevel(anchorId);

    const anchorIndex = rows.indexOf(anchorTr);
    const activeIndex = rows.indexOf(activeTr);

    if (anchorIndex < 0 || activeIndex < 0) return false;

    const from = Math.min(anchorIndex, activeIndex);
    const to = Math.max(anchorIndex, activeIndex);

    state.anchorId = anchorId;
    state.activeId = activeId;
    state.contextKey = anchorCtx;
    state.ids = new Set(
      rows
        .slice(from, to + 1)
        .map((tr) => tr.querySelector(".row[data-id]")?.dataset?.id)
        .filter(Boolean)
    );

    return true;
  }

  function selectCellForRow(id) {
    const h = host();
    if (!h || !id) return;

    const selectedCell = h.querySelector("td.table-cell-selected");
    const selectedColIndex = Number(selectedCell?.dataset?.colIndex || 0);

    const targetCell =
      h.querySelector(
        `td.table-cell[data-row-id="${cssEscapeLocal(id)}"][data-col-index="${selectedColIndex}"]`
      ) ||
      h.querySelector(
        `td.table-cell[data-row-id="${cssEscapeLocal(id)}"]`
      );

    if (targetCell) {
      window.tableCellNav?.selectCell?.(targetCell, {
        focus: true,
        scroll: false,
      });
    }
  }

  function focusAnchor() {
    if (!state.anchorId) return;

    window.selectedId = state.anchorId;
    window.treeHasFocus = true;

    selectCellForRow(state.anchorId);
  }

  function handleRangeKey(dir) {
    if (!isTableViewActive()) return false;

    const currentId = getSelectedRowId();
    if (!currentId) return false;

    const ctx = contextKeyForId(currentId);
    if (!ctx) return false;

    const rows = tableRowsBySameLevel(currentId);
    const currentTr = trById(currentId);
    const currentIndex = rows.indexOf(currentTr);

    if (currentIndex < 0) return false;

    if (!state.anchorId || state.contextKey !== ctx) {
      const nextTr = rows[currentIndex + dir];
      const nextId = nextTr?.querySelector(".row[data-id]")?.dataset?.id;

      if (!nextId) return false;

      state.anchorId = currentId;
      state.activeId = nextId;
      state.contextKey = ctx;

      if (!setRange(currentId, nextId)) {
        state.ids = new Set([currentId, nextId]);
      }

      focusAnchor();
      applyClasses();

      return true;
    }

    const activeTr = trById(state.activeId) || trById(state.anchorId);
    const activeIndex = rows.indexOf(activeTr);

    if (activeIndex < 0) return false;

    const nextActiveTr = rows[activeIndex + dir];
    const nextActiveId =
      nextActiveTr?.querySelector(".row[data-id]")?.dataset?.id;

    if (!nextActiveId) return false;

    state.activeId = nextActiveId;

    if (!setRange(state.anchorId, nextActiveId)) {
      state.ids = new Set([state.anchorId, nextActiveId]);
    }

    focusAnchor();
    applyClasses();

    return true;
  }

  function handleSelectAll() {
  if (!isTableViewActive()) return false;

  const rows = tableRowsAllVisible();
  if (!rows.length) return false;

  const ids = rows.map(getRowIdFromTr).filter(Boolean);
  if (!ids.length) return false;

  const currentId = getSelectedRowId();
  const anchorId = currentId && ids.includes(currentId) ? currentId : ids[0];

  clearOtherTableSelections();

  state.anchorId = anchorId;
  state.activeId = ids[ids.length - 1];
  state.contextKey = "all";
  state.ids = new Set(ids);

  focusAnchor();
  applyClasses();

  return true;
}


function handleKeydown(e) {
  if (!isTableViewActive()) return;
  if (isEditingNow()) return;

  if (e.repeat) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    return;
  }


    if (window.hotkeysMode === "custom") return;
    if (typeof isHotkey !== "function") return;

    if (isHotkey(e, "rangeUp")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleRangeKey(-1);
      return;
    }

    if (isHotkey(e, "rangeDown")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleRangeKey(+1);
      return;
    }

    if (isHotkey(e, "selectAll")) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();

  handleSelectAll();
  return;
}
  }

  function handlePointerClear(e) {
    if (!isTableViewActive()) return;
    if (!state.ids.size) return;

    /*
      Любой клик мышкой — это новый обычный выбор.
      Поэтому мультивыделение должно сняться.
    */
    reset();
  }

  function patchRenderTableView() {
    if (window.renderTableView?.__tableMultiSelectTreePatched) return;
    if (typeof window.renderTableView !== "function") return;

    const original = window.renderTableView;

    window.renderTableView = function patchedRenderTableView() {
      const result = original.apply(this, arguments);

      requestAnimationFrame(() => {
        applyClasses();
      });

      return result;
    };

    window.renderTableView.__tableMultiSelectTreePatched = true;
  }

  function init() {
    if (document.__tableMultiSelectTreeBound) return;

    document.__tableMultiSelectTreeBound = true;

    injectStyles();
    patchRenderTableView();

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("mousedown", handlePointerClear, true);

    if (isTableViewActive()) {
      requestAnimationFrame(() => {
        applyClasses();
      });
    }
  }

  window.tableMultiSelectTree = {
    init,
    clear: reset,
    getIds() {
      return Array.from(state.ids);
    },
    has(id) {
      return state.ids.has(id);
    },
    size() {
      return state.ids.size;
    },
    handleRangeKey,
handleSelectAll,
debug() {
      return {
        anchorId: state.anchorId,
        activeId: state.activeId,
        contextKey: state.contextKey,
        ids: Array.from(state.ids),
      };
    },
  };

  init();
})();