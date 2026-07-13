(function () {
  if (typeof window === "undefined") return;

  function isTableViewActiveForHotkeys() {
    const host = document.getElementById("tree");

    return !!(
      host &&
      host.querySelector(".structure-table")
    );
  }

  function isTableHotkeyTypingTarget(el) {
    if (!el) return false;

    const tag = (el.tagName || "").toLowerCase();

    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      el.isContentEditable ||
      el.classList?.contains("edit") ||
      el.classList?.contains("table-rich-cell-editor") ||
      el.classList?.contains("table-duration-mask-editor")
    );
  }

  function isTableInnerControlTarget(el) {
    if (!el) return false;

    const tag = (el.tagName || "").toLowerCase();

    return (
      tag === "button" ||
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      tag === "label" ||
      el.isContentEditable ||
      el.closest?.("button") ||
      el.closest?.("input") ||
      el.closest?.("textarea") ||
      el.closest?.("select") ||
      el.closest?.(".table-tag-compact-editor") ||
      el.closest?.(".table-composite-datetime-editor") ||
      el.closest?.(".table-duration-mask-editor") ||
      el.closest?.(".table-rich-cell-editor")
    );
  }

  function stopTableGlobalHotkey(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  }

  function getSelectedTableCell() {
    const host = document.getElementById("tree");
    if (!host) return null;

    return host.querySelector("td.table-cell-selected");
  }

  function getTableRowNodeIdFromTr(tr) {
    if (!tr) return "";

    const nameCell = tr.querySelector(".row[data-id]");
    return nameCell?.dataset?.id || "";
  }


  function getSelectedTableHotkeyNodeId() {
    const selectedCell = getSelectedTableCell();

    if (selectedCell) {
      const idFromCell =
        selectedCell.dataset.id ||
        selectedCell.dataset.rowId ||
        "";

      if (idFromCell) return idFromCell;

      const tr = selectedCell.closest("tr");
      const idFromRow = getTableRowNodeIdFromTr(tr);

      if (idFromRow) return idFromRow;
    }

    return window.selectedId || selectedId || "";
  }

  function withSelectedTableNode(fn) {
  const id = getSelectedTableHotkeyNodeId();
  if (!id) return false;

  const found =
    typeof findWithParent === "function"
      ? findWithParent(root, id)
      : null;

  if (!found?.node) return false;

  selectedId = found.node.id;
  treeHasFocus = true;

  fn(found.node);

  return true;
}

  function handleTableObjectHotkeys(e) {
    if (window.hotkeysMode === "custom") return;
    if (!isTableViewActiveForHotkeys()) return;
    if (typeof isHotkey !== "function") return;

    // Не лезем внутрь input, dropdown, кнопок, rich-редакторов и маски таймера.
    if (
      isTableHotkeyTypingTarget(document.activeElement) ||
      isTableHotkeyTypingTarget(e.target) ||
      isTableInnerControlTarget(document.activeElement) ||
      isTableInnerControlTarget(e.target)
    ) {
      return;
    }

    const selectedCell = getSelectedTableCell();
    if (!selectedCell) return;

    if (isHotkey(e, "undo")) {
      stopTableGlobalHotkey(e);
      undo?.();
      return;
    }

    if (isHotkey(e, "redo")) {
      stopTableGlobalHotkey(e);
      redo?.();
      return;
    }

    if (isHotkey(e, "delete")) {
      if (
        withSelectedTableNode(() => {
          removeSelected?.();
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "addCaption")) {
      if (
        withSelectedTableNode((node) => {
          addCaption?.(node.id);
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "addChild")) {
      if (
        withSelectedTableNode((node) => {
          addChild?.(node.id);
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "addSibling")) {
      if (
        withSelectedTableNode((node) => {
          const focusedRootId = window.objectFocus?.getFocusedRootId?.();
          const isFocusedRoot =
            !!focusedRootId && focusedRootId === node.id;

          if (isFocusedRoot) {
            addChild?.(node.id);
          } else {
            addSibling?.(node.id);
          }
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

        if (isHotkey(e, "levelMoveUp")) {
      if (
        withSelectedTableNode(() => {
          window.levelMove?.up?.();
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "levelMoveDown")) {
      if (
        withSelectedTableNode(() => {
          window.levelMove?.down?.();
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "branchMoveLeft")) {
      if (
        withSelectedTableNode(() => {
          window.branchMove?.left?.();
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "branchMoveRight")) {
      if (
        withSelectedTableNode(() => {
          window.branchMove?.right?.();
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "focusIntoObject")) {
      if (
        withSelectedTableNode((node) => {
          window.objectFocus?.focusInto?.(node.id);
        })
      ) {
        stopTableGlobalHotkey(e);
      }

      return;
    }

    if (isHotkey(e, "focusOutObject")) {
      stopTableGlobalHotkey(e);

      const focusedRootId = window.objectFocus?.getFocusedRootId?.();

      if (focusedRootId) {
        const parentId =
          typeof parentOf === "function"
            ? parentOf(focusedRootId)
            : null;

        window.objectFocus?.focusOutTo?.(parentId || null);
      } else {
        window.objectFocus?.focusOutTo?.(null);
      }

      return;
    }
  }

  function init() {
    if (document.__tableObjectHotkeysBound) return;

    document.__tableObjectHotkeysBound = true;

    document.addEventListener("keydown", handleTableObjectHotkeys, true);
  }

  window.tableHotkeys = {
  init,
};

init();
})();