// hotkey_hold_repeat.js
// Единый repeat для зажатых хоткей-комбинаций.
// Первое нажатие обрабатывают обычные keydown-обработчики.
// Этот файл запускает только повтор после INITIAL_DELAY.

(function () {
  if (typeof window === "undefined") return;

  const INITIAL_DELAY = 450;
  const REPEAT_MS = 60;

  let heldCode = null;
  let heldAction = null;
  let heldEventSnapshot = null;
  let tStart = null;
  let tRepeat = null;

  const downKeys = new Set();

  const REPEAT_ACTIONS = [
    // Навигация
    "navUp",
    "navDown",
    "navLeft",
    "navRight",

    "levelNavUp",
    "levelNavDown",
    "branchNavLeft",
    "branchNavRight",

    // Мультивыделение
    "rangeUp",
    "rangeDown",
    "deepUp",
    "deepDown",
    "branchRangeLeft",
    "branchRangeRight",

    // Перемещение
    "moveUp",
    "moveDown",
    "levelMoveUp",
    "levelMoveDown",
    "branchMoveLeft",
    "branchMoveRight",
  ];

  function isTableViewActive() {
    return window.currentView === window.VIEW?.TABLE;
  }

  function isTypingTarget(el) {
    if (!el) return false;

    const tag = (el.tagName || "").toLowerCase();

    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      el.isContentEditable ||
      el.closest?.(".edit") ||
      el.closest?.(".table-cell-editor") ||
      el.closest?.(".table-rich-cell-editor") ||
      el.closest?.(".table-duration-mask-editor") ||
      el.closest?.(".table-dropdown-menu") ||
      el.closest?.(".table-tag-compact-menu")
    );
  }

  function isModifierKey(e) {
    return (
      e.key === "Shift" ||
      e.key === "Alt" ||
      e.key === "Control" ||
      e.key === "Meta" ||
      e.key === "OS"
    );
  }

  function isRepeatableBaseKey(e) {
    return (
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight"
    );
  }

  function stop() {
    heldCode = null;
    heldAction = null;
    heldEventSnapshot = null;

    if (tStart) {
      clearTimeout(tStart);
      tStart = null;
    }

    if (tRepeat) {
      clearInterval(tRepeat);
      tRepeat = null;
    }
  }

  function makeEventSnapshot(e) {
    return {
      key: e.key,
      code: e.code,
      shiftKey: !!e.shiftKey,
      altKey: !!e.altKey,
      ctrlKey: !!e.ctrlKey,
      metaKey: !!e.metaKey,
    };
  }

  function resolveActionFromEvent(e) {
    if (!isRepeatableBaseKey(e)) return null;
    if (typeof isHotkey !== "function") return null;
    if (window.hotkeysMode === "custom") return null;

    for (const action of REPEAT_ACTIONS) {
      if (isHotkey(e, action)) {
        return action;
      }
    }

    return null;
  }

  function canRunTreeActionNow() {
    if (typeof isTreeLocked === "function" && isTreeLocked()) return false;
    if (typeof treeHasFocus !== "undefined" && !treeHasFocus) return false;
    if (typeof selectedId === "undefined" || !selectedId) return false;

    return true;
  }

  function canRunTableActionNow() {
    return !!(
      isTableViewActive() &&
      document.getElementById("tree")?.querySelector?.(".structure-table")
    );
  }

  function runTableAction(action) {
    if (!canRunTableActionNow()) {
      stop();
      return;
    }

    switch (action) {
      case "navUp":
        
        return window.tableCellNav?.moveUp?.();

      case "navDown":
       
        return window.tableCellNav?.moveDown?.();

      case "navLeft":
      
        return window.tableCellNav?.moveLeft?.();

      case "navRight":
       
        return window.tableCellNav?.moveRight?.();

      case "rangeUp":
        return window.tableMultiSelectTree?.handleRangeKey?.(-1);

      case "rangeDown":
        return window.tableMultiSelectTree?.handleRangeKey?.(+1);

      // Пока глубокое/веточное мультивыделение в таблице не подключаем.
      // Когда сделаем отдельные table-модули для deep/branch — добавим сюда.
      case "deepUp":
        return window.tableMultiSelectDeep?.handleDeepRangeKey?.(-1);

        case "deepDown":
        return window.tableMultiSelectDeep?.handleDeepRangeKey?.(+1);

        case "branchRangeLeft":
  return window.tableMultiSelectBranch?.handleBranchRangeKey?.(-1);

case "branchRangeRight":
  return window.tableMultiSelectBranch?.handleBranchRangeKey?.(+1);
        return undefined;
    }

    return undefined;
  }

  function runTreeAction(action) {
    if (!canRunTreeActionNow()) {
      stop();
      return;
    }

    switch (action) {
      case "rangeUp":
        return window.multiSelect?.handleRangeKey?.(-1);

      case "rangeDown":
        return window.multiSelect?.handleRangeKey?.(+1);

      case "deepUp":
        return window.multiSelectDeep?.handleDeepRangeKey?.(-1);

      case "deepDown":
        return window.multiSelectDeep?.handleDeepRangeKey?.(+1);

      case "branchRangeLeft":
        return window.multiSelectBranch?.handleBranchRangeKey?.(-1);

      case "branchRangeRight":
        return window.multiSelectBranch?.handleBranchRangeKey?.(+1);

      case "navUp":
        return typeof moveSelection === "function"
          ? moveSelection(-1)
          : undefined;

      case "navDown":
        return typeof moveSelection === "function"
          ? moveSelection(+1)
          : undefined;

      case "navLeft":
        return typeof goParent === "function"
          ? goParent(selectedId)
          : undefined;

      case "navRight":
        return typeof goDeeper === "function"
          ? goDeeper(selectedId)
          : undefined;

      case "moveUp":
        return typeof moveByVisibleOrder === "function"
          ? moveByVisibleOrder(-1)
          : undefined;

      case "moveDown":
        return typeof moveByVisibleOrder === "function"
          ? moveByVisibleOrder(+1)
          : undefined;

      case "levelNavUp":
        return window.levelNav?.up?.();

      case "levelNavDown":
        return window.levelNav?.down?.();

      case "branchNavLeft":
        return window.branchNav?.left?.();

      case "branchNavRight":
        return window.branchNav?.right?.();

      case "levelMoveUp":
        return window.levelMove?.up?.();

      case "levelMoveDown":
        return window.levelMove?.down?.();

      case "branchMoveLeft":
        return window.branchMove?.left?.();

      case "branchMoveRight":
        return window.branchMove?.right?.();
    }

    return undefined;
  }

  function runAction(action) {
    if (isTableViewActive()) {
      return runTableAction(action);
    }

    return runTreeAction(action);
  }

  function step() {
    if (!heldCode || !heldAction || !downKeys.has(heldCode)) {
      stop();
      return;
    }

    runAction(heldAction);
  }

  function startRepeat(action, code, e) {
    stop();

    heldAction = action;
    heldCode = code;
    heldEventSnapshot = makeEventSnapshot(e);

    tStart = setTimeout(() => {
      if (!heldAction || !heldCode) return;

      tRepeat = setInterval(() => {
        step();
      }, REPEAT_MS);
    }, INITIAL_DELAY);
  }

  function isSameHeldCombo(e) {
    if (!heldCode || !heldEventSnapshot) return false;
    if (e.code !== heldCode) return false;

    return (
      !!e.shiftKey === heldEventSnapshot.shiftKey &&
      !!e.altKey === heldEventSnapshot.altKey &&
      !!e.ctrlKey === heldEventSnapshot.ctrlKey &&
      !!e.metaKey === heldEventSnapshot.metaKey
    );
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (isTypingTarget(e.target)) return;
      if (!isRepeatableBaseKey(e)) return;

      const action = resolveActionFromEvent(e);
      if (!action) return;

      /*
        Повторные browser keydown глушим.
        Повтор делает только наш setInterval.
      */
      if (e.repeat) {
        if (isSameHeldCombo(e)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }

        return;
      }

      if (e.code) {
        downKeys.add(e.code);
      }

      startRepeat(action, e.code, e);
    },
    true
  );

  window.addEventListener(
    "keyup",
    (e) => {
      if (e.code) {
        downKeys.delete(e.code);
      }

      if (!heldCode) return;

      if (e.code === heldCode || isModifierKey(e)) {
        stop();
      }
    },
    true
  );

  window.addEventListener("blur", () => {
    downKeys.clear();
    stop();
  });

  window.addEventListener("focus", () => {
    downKeys.clear();
    stop();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      downKeys.clear();
      stop();
    }
  });

  window.addEventListener("mouseup", stop, true);

  window.hotkeyHoldRepeat = {
    stop,
    debug() {
      return {
        heldCode,
        heldAction,
        heldEventSnapshot,
        downKeys: Array.from(downKeys),
      };
    },
  };
})();