// table_multi_select_deep.js
// Глубокое мультивыделение в таблице.
// Выделяет диапазон по видимым строкам таблицы, без ограничения одним уровнем.
// Хоткеи:
// - deepUp
// - deepDown

(function () {
  if (typeof window === "undefined") return;

  const OWNER = "table-deep";

  const state = {
    anchorId: null,
    activeId: null,
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

  function getRowIdFromTr(tr) {
    return tr?.querySelector?.(".row[data-id]")?.dataset?.id || "";
  }

  function getVisibleTableRows() {
    const h = host();
    if (!h) return [];

    return Array.from(h.querySelectorAll(".structure-table tbody tr")).filter(
      (tr) => !!getRowIdFromTr(tr)
    );
  }

function clearOwnClasses() {
  const h = host();
  if (!h) return;

  /*
    Чистим только следы branch-выделения.
    Не трогаем визуальные классы других табличных мультивыделений.
  */
  h.querySelectorAll(`.row[data-multi-owner="${OWNER}"]`).forEach((row) => {
    row.classList.remove("multi");
    row.classList.remove("multi-anchor");
    row.removeAttribute("data-multi-owner");
  });

  h.querySelectorAll(`.structure-table tbody tr[data-table-multi-owner="${OWNER}"]`).forEach((tr) => {
    tr.classList.remove("table-row-multi");
    tr.classList.remove("table-row-multi-anchor");
    tr.removeAttribute("data-table-multi-owner");
  });
}

function applyClasses() {
  if (!isTableViewActive()) return;

  clearOwnClasses();

  for (const id of state.ids) {
    const tr = trById(id);

    if (!tr) continue;

    tr.classList.add("table-row-multi");
    tr.setAttribute("data-table-multi-owner", OWNER);

    if (id === state.anchorId) {
      tr.classList.add("table-row-multi-anchor");
    }
  }
}

  function reset() {
    state.anchorId = null;
    state.activeId = null;
    state.ids.clear();

    clearOwnClasses();
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

  function setDeepRange(anchorId, activeId) {
    const rows = getVisibleTableRows();

    const anchorTr = trById(anchorId);
    const activeTr = trById(activeId);

    if (!anchorTr || !activeTr) return false;

    const anchorIndex = rows.indexOf(anchorTr);
    const activeIndex = rows.indexOf(activeTr);

    if (anchorIndex < 0 || activeIndex < 0) return false;

    const from = Math.min(anchorIndex, activeIndex);
    const to = Math.max(anchorIndex, activeIndex);

    state.anchorId = anchorId;
    state.activeId = activeId;
    state.ids = new Set(
      rows
        .slice(from, to + 1)
        .map(getRowIdFromTr)
        .filter(Boolean)
    );

    return true;
  }

  function handleDeepRangeKey(dir) {
    if (!isTableViewActive()) return false;

    const currentId = getSelectedRowId();
    if (!currentId) return false;

    const rows = getVisibleTableRows();
    const currentTr = trById(currentId);
    const currentIndex = rows.indexOf(currentTr);

    if (currentIndex < 0) return false;

    if (!state.anchorId) {
      const nextTr = rows[currentIndex + dir];
      const nextId = getRowIdFromTr(nextTr);

      if (!nextId) return false;

      state.anchorId = currentId;
      state.activeId = nextId;

      setDeepRange(currentId, nextId);

      window.tableMultiSelectTree?.clear?.();

      focusAnchor();
      applyClasses();

      return true;
    }

    const activeTr = trById(state.activeId) || trById(state.anchorId);
    const activeIndex = rows.indexOf(activeTr);

    if (activeIndex < 0) return false;

    const nextActiveTr = rows[activeIndex + dir];
    const nextActiveId = getRowIdFromTr(nextActiveTr);

    if (!nextActiveId) return false;

    state.activeId = nextActiveId;

    setDeepRange(state.anchorId, nextActiveId);

    window.tableMultiSelectTree?.clear?.();

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

    if (isHotkey(e, "deepUp")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleDeepRangeKey(-1);
      return;
    }

    if (isHotkey(e, "deepDown")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleDeepRangeKey(+1);
      return;
    }
  }

  function handlePointerClear() {
    if (!state.ids.size) return;
    reset();
  }

  function patchRenderTableView() {
    if (window.renderTableView?.__tableMultiSelectDeepPatched) return;
    if (typeof window.renderTableView !== "function") return;

    const original = window.renderTableView;

    window.renderTableView = function patchedRenderTableView() {
      const result = original.apply(this, arguments);

      requestAnimationFrame(() => {
        applyClasses();
      });

      return result;
    };

    window.renderTableView.__tableMultiSelectDeepPatched = true;
  }

  function init() {
    if (document.__tableMultiSelectDeepBound) return;

    document.__tableMultiSelectDeepBound = true;

    patchRenderTableView();

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("mousedown", handlePointerClear, true);

    if (isTableViewActive()) {
      requestAnimationFrame(() => {
        applyClasses();
      });
    }
  }

  window.tableMultiSelectDeep = {
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
    handleDeepRangeKey,
    debug() {
      return {
        anchorId: state.anchorId,
        activeId: state.activeId,
        ids: Array.from(state.ids),
      };
    },
  };

  init();
})();