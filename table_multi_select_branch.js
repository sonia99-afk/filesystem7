// table_multi_select_branch.js
// Веточное мультивыделение в таблице.
// Логика:
// parent <-> current <-> firstChild <-> firstChild...
//
// Хоткеи:
// - branchRangeLeft
// - branchRangeRight

(function () {
  if (typeof window === "undefined") return;

  const OWNER = "table-branch";

  const state = {
    anchorId: null,
    activeId: null,
    branchKey: null,
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

  function buildAncestorChain(id) {
    const out = [];
    let cur = id;

    while (cur) {
      out.push(cur);

      if (typeof parentOf !== "function") break;

      cur = parentOf(cur);
    }

    out.reverse();

    return out;
  }

  function buildDescendantFirstChildChain(id) {
    const out = [];
    let cur = null;

    if (typeof firstChildOf === "function") {
      cur = firstChildOf(id);
    }

    while (cur) {
      out.push(cur);
      cur = firstChildOf(cur);
    }

    return out;
  }

  function rowsInBranchChain(branchKey) {
    if (!branchKey) return [];

    const ids = [
      ...buildAncestorChain(branchKey),
      ...buildDescendantFirstChildChain(branchKey),
    ];

    return ids
      .map((id) => trById(id))
      .filter(Boolean);
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
    state.branchKey = null;
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

  function clearOtherTableSelections() {
    window.tableMultiSelectTree?.clear?.();
    window.tableMultiSelectDeep?.clear?.();
  }

  function setBranchRange(branchKey, anchorId, activeId) {
    const list = rowsInBranchChain(branchKey);

    const anchorTr = trById(anchorId);
    const activeTr = trById(activeId);

    if (!anchorTr || !activeTr) return false;

    const anchorIndex = list.indexOf(anchorTr);
    const activeIndex = list.indexOf(activeTr);

    if (anchorIndex < 0 || activeIndex < 0) return false;

    const from = Math.min(anchorIndex, activeIndex);
    const to = Math.max(anchorIndex, activeIndex);

    state.branchKey = branchKey;
    state.anchorId = anchorId;
    state.activeId = activeId;

    state.ids = new Set(
      list
        .slice(from, to + 1)
        .map(getRowIdFromTr)
        .filter(Boolean)
    );

    return true;
  }

  function handleBranchRangeKey(dir) {
    if (!isTableViewActive()) return false;

    const currentId = getSelectedRowId();
    if (!currentId) return false;

    const branchKey = state.branchKey || currentId;
    const list = rowsInBranchChain(branchKey);

    const currentTr = trById(currentId);
    const currentIndex = list.indexOf(currentTr);

    if (currentIndex < 0) return false;

    if (!state.anchorId) {
      const nextTr = list[currentIndex + dir];
      const nextId = getRowIdFromTr(nextTr);

      if (!nextId) return false;

      clearOtherTableSelections();

      if (!setBranchRange(currentId, currentId, nextId)) {
        return false;
      }

      focusAnchor();
      applyClasses();

      return true;
    }

    const activeTr = trById(state.activeId) || trById(state.anchorId);
    const activeIndex = list.indexOf(activeTr);

    if (activeIndex < 0) return false;

    const nextActiveTr = list[activeIndex + dir];
    const nextActiveId = getRowIdFromTr(nextActiveTr);

    if (!nextActiveId) return false;

    if (!setBranchRange(state.branchKey, state.anchorId, nextActiveId)) {
      return false;
    }

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

    if (isHotkey(e, "branchRangeLeft")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleBranchRangeKey(-1);
      return;
    }

    if (isHotkey(e, "branchRangeRight")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      handleBranchRangeKey(+1);
      return;
    }
  }

  function handlePointerClear() {
    if (!state.ids.size) return;

    reset();
  }

  function patchRenderTableView() {
    if (window.renderTableView?.__tableMultiSelectBranchPatched) return;
    if (typeof window.renderTableView !== "function") return;

    const original = window.renderTableView;

    window.renderTableView = function patchedRenderTableView() {
      const result = original.apply(this, arguments);

      requestAnimationFrame(() => {
        applyClasses();
      });

      return result;
    };

    window.renderTableView.__tableMultiSelectBranchPatched = true;
  }

  function init() {
    if (document.__tableMultiSelectBranchBound) return;

    document.__tableMultiSelectBranchBound = true;

    patchRenderTableView();

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("mousedown", handlePointerClear, true);

    if (isTableViewActive()) {
      requestAnimationFrame(() => {
        applyClasses();
      });
    }
  }

  window.tableMultiSelectBranch = {
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
    handleBranchRangeKey,
    debug() {
      return {
        branchKey: state.branchKey,
        anchorId: state.anchorId,
        activeId: state.activeId,
        ids: Array.from(state.ids),
      };
    },
  };

  init();
})();