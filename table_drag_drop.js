(function () {
  if (typeof window === "undefined") return;

  const DRAG_START_DISTANCE = 6;

  let dragState = null;
  let dropLine = null;
  let stylesInjected = false;

  function isTableViewActive() {
    const host = document.getElementById("tree");

    return (
      !!host?.querySelector?.(".structure-table") &&
      (!window.VIEW || window.currentView === window.VIEW.TABLE)
    );
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement("style");

    style.textContent = `
      .structure-table.table-dragging,
      .structure-table.table-dragging * {
        cursor: grabbing !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      body.table-drag-drop-active,
      body.table-drag-drop-active * {
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      .structure-table tr.table-dragging-row td {
        opacity: 0.45;
      }

      .table-drag-drop-line {
        position: fixed;
        height: 2px;
        background: #111;
        z-index: 0;
        pointer-events: none;
        display: none;
      }

      .table-drag-drop-line.is-inside {
        height: 2px;
      }
    `;

    document.head.appendChild(style);
  }

  function clearTextSelection() {
    window.getSelection?.()?.removeAllRanges?.();
  }

  function isInteractiveTarget(el) {
    if (!el) return false;

    const interactive = el.closest?.(
      [
        "button",
        "input",
        "textarea",
        "select",
        "label",
        "a",
        "[contenteditable='true']",
        ".edit",
        ".table-cell-editor",
        ".table-rich-cell-editor",
        ".table-duration-mask-editor",
        ".table-tag-compact-menu",
        ".table-tag-compact-option",
        ".table-tag-compact-action",
      ].join(",")
    );

    return !!interactive;
  }

  function getTableFromEventTarget(target) {
    return target?.closest?.(".structure-table") || null;
  }

  function getRowFromEventTarget(target) {
    return target?.closest?.(".structure-table tbody tr") || null;
  }

  function getRowId(tr) {
    if (!tr) return "";

    return (
      tr.dataset.id ||
      tr.querySelector?.(".row[data-id]")?.dataset?.id ||
      tr.querySelector?.("td[data-id]")?.dataset?.id ||
      ""
    );
  }

  function getNodeById(id) {
    if (!id || typeof findWithParent !== "function") return null;

    return findWithParent(root, id);
  }

  function findTableRowById(table, id) {
    if (!table || !id) return null;

    return (
      Array.from(table.querySelectorAll("tbody tr")).find((tr) => {
        return getRowId(tr) === id;
      }) || null
    );
  }

  function ensureDropLine() {
    if (dropLine && document.body.contains(dropLine)) {
      return dropLine;
    }

    dropLine = document.createElement("div");
    dropLine.className = "table-drag-drop-line";
    document.body.appendChild(dropLine);

    return dropLine;
  }

  function hideDropLine() {
    if (!dropLine) return;

    dropLine.style.display = "none";
    dropLine.classList.remove("is-inside");
  }

  function showDropLineForRow(table, tr, mode) {
    if (!table || !tr || !mode) {
      hideDropLine();
      return;
    }

    const line = ensureDropLine();
    const tableBox = table.getBoundingClientRect();
    const rowBox = tr.getBoundingClientRect();

    let y;

    if (mode === "before") {
      y = rowBox.top;
    } else if (mode === "after") {
      y = rowBox.bottom;
    } else {
      y = rowBox.top + rowBox.height / 2;
      line.classList.add("is-inside");
    }

    if (mode !== "inside") {
      line.classList.remove("is-inside");
    }

    line.style.display = "block";
    line.style.left = `${Math.round(tableBox.left)}px`;
    line.style.top = `${Math.round(y - 1)}px`;
    line.style.width = `${Math.round(tableBox.width)}px`;
  }

  function clearDragClasses(table) {
    if (!table) return;

    table.classList.remove("table-dragging");
    document.body.classList.remove("table-drag-drop-active");

    table.querySelectorAll("tr").forEach((tr) => {
      tr.classList.remove(
        "table-dragging-row",
        "table-drop-before",
        "table-drop-after",
        "table-drop-inside"
      );
    });

    clearTextSelection();
    hideDropLine();
  }

  function setSubtreeLevel(node, level) {
    if (!node) return;

    node.level = level;

    (node.children || []).forEach((child) => {
      setSubtreeLevel(child, level + 1);
    });
  }

  function isDescendantOf(nodeId, possibleParentId) {
    const parent = getNodeById(possibleParentId);
    if (!parent?.node) return false;

    let found = false;

    function walk(node) {
      (node.children || []).forEach((child) => {
        if (child.id === nodeId) {
          found = true;
        }

        walk(child);
      });
    }

    walk(parent.node);

    return found;
  }

  function canNodeHaveChild(node) {
    if (!node) return false;

    if (typeof canHaveChild === "function") {
      return canHaveChild(node);
    }

    if (window.LEVEL && typeof window.LEVEL.ROLE === "number") {
      return node.level < window.LEVEL.ROLE;
    }

    return true;
  }

  function pushMoveHistory() {
    if (typeof pushHistory !== "function") return;

    if (typeof snapshot === "function") {
      pushHistory(snapshot());
      return;
    }

    pushHistory();
  }

  function moveNodeToParentAt(nodeId, newParentId, index) {
    if (!nodeId || !newParentId) return false;
    if (nodeId === root?.id) return false;
    if (nodeId === newParentId) return false;
    if (isDescendantOf(newParentId, nodeId)) return false;

    const from = getNodeById(nodeId);
    const to = getNodeById(newParentId);

    if (!from?.node || !from?.parent || !to?.node) return false;
    if (!canNodeHaveChild(to.node)) return false;

    const oldArr = from.parent.children || [];
    const oldIdx = oldArr.findIndex((item) => item.id === nodeId);

    if (oldIdx < 0) return false;

    pushMoveHistory();

    const [node] = oldArr.splice(oldIdx, 1);

    const newArr = to.node.children || [];
    to.node.children = newArr;

    let nextIndex = Math.max(0, Math.min(index, newArr.length));

    if (from.parent.id === to.node.id && oldIdx < nextIndex) {
      nextIndex--;
    }

    newArr.splice(nextIndex, 0, node);

    setSubtreeLevel(node, to.node.level + 1);

    selectedId = node.id;
    treeHasFocus = true;

    return true;
  }

  function moveNodeBefore(targetId, movingId) {
    const target = getNodeById(targetId);

    if (!target?.node || !target?.parent) return false;

    const siblings = target.parent.children || [];
    const index = siblings.findIndex((item) => item.id === targetId);

    if (index < 0) return false;

    return moveNodeToParentAt(movingId, target.parent.id, index);
  }

  function moveNodeAfter(targetId, movingId) {
    const target = getNodeById(targetId);

    if (!target?.node || !target?.parent) return false;

    const siblings = target.parent.children || [];
    const index = siblings.findIndex((item) => item.id === targetId);

    if (index < 0) return false;

    return moveNodeToParentAt(movingId, target.parent.id, index + 1);
  }

  function moveNodeInside(targetId, movingId) {
    const target = getNodeById(targetId);
    const moving = getNodeById(movingId);

    if (!target?.node || !moving?.node) return false;
    if (!canNodeHaveChild(target.node)) return false;

    return moveNodeToParentAt(movingId, targetId, 0);
  }

  function rerenderAfterMove() {
    if (typeof render === "function") {
      render();
      return;
    }

    if (typeof renderTableView === "function") {
      renderTableView();
    }
  }

  function cancelDrag() {
    if (dragState?.table) {
      clearDragClasses(dragState.table);
    }

    dragState = null;
  }

  function finishDrag() {
    if (!dragState) return;

    const state = dragState;
    dragState = null;

    clearDragClasses(state.table);

    if (!state.started || !state.targetId || !state.mode) {
      return;
    }

    let moved = false;

    if (state.mode === "before") {
      moved = moveNodeBefore(state.targetId, state.id);
    } else if (state.mode === "after") {
      moved = moveNodeAfter(state.targetId, state.id);
    } else if (state.mode === "inside") {
      moved = moveNodeInside(state.targetId, state.id);
    }

    if (moved) {
      rerenderAfterMove();
    }
  }

  function updateDragTarget(e) {
    if (!dragState) return;

    const table = dragState.table;

    if ((e.buttons & 1) !== 1) {
      cancelDrag();
      return;
    }

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (!dragState.started && Math.hypot(dx, dy) < DRAG_START_DISTANCE) {
      return;
    }

    if (!dragState.started) {
      dragState.started = true;
      table.classList.add("table-dragging");
      document.body.classList.add("table-drag-drop-active");
      clearTextSelection();
    }

    e.preventDefault();
    clearTextSelection();

    clearDragClasses(table);

    table.classList.add("table-dragging");
    document.body.classList.add("table-drag-drop-active");

    const movingTr = findTableRowById(table, dragState.id);

    if (movingTr) {
      movingTr.classList.add("table-dragging-row");
    }

    const targetTr = getRowFromEventTarget(e.target);
    const targetId = getRowId(targetTr);

    dragState.targetId = null;
    dragState.mode = null;

    if (!targetTr || !targetId) {
      hideDropLine();
      return;
    }

    if (targetId === dragState.id) {
      hideDropLine();
      return;
    }

    if (isDescendantOf(targetId, dragState.id)) {
      hideDropLine();
      return;
    }

    const moving = getNodeById(dragState.id);
    const target = getNodeById(targetId);

    if (!moving?.node || !target?.node) {
      hideDropLine();
      return;
    }

    const box = targetTr.getBoundingClientRect();
    const y = e.clientY - box.top;

    let mode = null;

    if (y < box.height * 0.28) {
      mode = "before";
    } else if (y > box.height * 0.72) {
      mode = "after";
    } else if (canNodeHaveChild(target.node)) {
      mode = "inside";
    }

    if (!mode) {
      hideDropLine();
      return;
    }

    dragState.targetId = targetId;
    dragState.mode = mode;

    showDropLineForRow(table, targetTr, mode);
  }

  function handleMouseDown(e) {
    if (!isTableViewActive()) return;
    if (e.button !== 0) return;
    if (e.detail > 1) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isInteractiveTarget(e.target)) return;

    const table = getTableFromEventTarget(e.target);
    const tr = getRowFromEventTarget(e.target);
    const id = getRowId(tr);

    if (!table || !tr || !id) return;
    if (id === root?.id) return;

    injectStyles();

    dragState = {
      table,
      id,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
      targetId: null,
      mode: null,
    };

    window.addEventListener("mousemove", updateDragTarget, true);
    window.addEventListener("mouseup", handleMouseUp, true);
  }

  function handleMouseUp() {
    window.removeEventListener("mousemove", updateDragTarget, true);
    window.removeEventListener("mouseup", handleMouseUp, true);

    finishDrag();
  }

  function initTableDragDrop() {
    if (document.__tableDragDropBound) return;

    document.__tableDragDropBound = true;

    document.addEventListener("mousedown", handleMouseDown, true);
  }

  window.tableDragDrop = {
    init: initTableDragDrop,
    cancel: cancelDrag,
  };

  initTableDragDrop();
})();