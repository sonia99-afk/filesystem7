(function () {
  if (typeof window === "undefined") return;

  window.hotkeysMode = window.hotkeysMode || "builtin";

  function isMac() {
    const p = String(navigator.platform || "").toLowerCase();
    if (p.includes("mac")) return true;
    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("mac os") || ua.includes("macintosh");
  }

  // Canonical internal modifier:
  // - User sees: Ctrl/Cmd
  // - Stored token: Primary
  // - Match: ctrlKey on Win/Linux, metaKey on macOS
  const PRIMARY = "Primary";

  const STORAGE_KEY = "org_structure_hotkeys_v1";

  const DEFAULTS = {
    // Добавления
    addSibling: "Shift+Enter",
    addChild: "Enter",

    addSiblingClick: "",
    addChildClick: "",

    // Навигация
    navUp: "Alt+ArrowUp",
    navDown: "Alt+ArrowDown",
    navLeft: "Alt+ArrowLeft",
    navRight: "Alt+ArrowRight",
    navClick: "Click",

    // Перемещение внутри уровня
    moveUp: "Primary+Alt+ArrowUp",
    moveDown: "Primary+Alt+ArrowDown",

    levelNavUp: "ArrowUp",
    levelNavDown: "ArrowDown",
    branchNavLeft: "ArrowLeft",
    branchNavRight: "ArrowRight",
    levelMoveUp: "Primary+ArrowUp",
    levelMoveDown: "Primary+ArrowDown",
    branchMoveLeft: "Primary+ArrowLeft",
    branchMoveRight: "Primary+ArrowRight",

    focusIntoObject: "Shift+BracketRight",
    focusOutObject: "Shift+BracketLeft",

    // Перемещение между уровнями
    indent: "",
    outdent: "",

    // Диапазон (один уровень)
    rangeUp: "Shift+ArrowUp",
    rangeDown: "Shift+ArrowDown",
    rangeClick: "Shift+Click",

    branchRangeLeft: "Shift+ArrowLeft",
    branchRangeRight: "Shift+ArrowRight",

    // Глубокое выделение (ветка)
    deepUp: "Shift+Alt+ArrowUp",
    deepDown: "Shift+Alt+ArrowDown",
    deepClick: "Alt+Shift+Click",

    // Прочее
    rename: "Primary+Enter",
    renameClick: "DblClick",
    delete: "Primary+Backspace",
    deleteClick: "",

    bold: "Primary+B",
    italic: "Primary+I",
    underline: "Primary+U",
    strike: "Primary+Shift+X",

    copy: "Primary+C",
    cut: "Primary+X",
    paste: "Primary+V",
    duplicate: "Primary+D",
    selectAll: "Primary+A",

    // Undo/Redo
    undo: "Primary+Z",
    redo: "Primary+Shift+Z",

    undoClick: "",
    redoClick: "",

    addCaption: "Alt+Enter",
    addCaptionLineBreak: "Shift+Enter",

        // Цвет текста
        textColor1: "Primary+1",
        textColor2: "Primary+2",
        textColor3: "Primary+3",
        textColor4: "Primary+4",
        textColor5: "Primary+5",
    
        // Цвет подложки
        bgColor1: "Primary+6",
        bgColor2: "Primary+7",
        bgColor3: "Primary+8",
        bgColor4: "Primary+9",
        bgColor5: "Primary+0",


  };

  // Display label for Primary in UI
  function primaryLabel() {
    return isMac() ? "Cmd" : "Ctrl";
  }

  function altLabel() {
    return isMac() ? "Opt" : "Alt";
  }

  function normalizeKeyName(k) {
    if (!k) return "";

    const raw = String(k).trim();
    if (!raw) return "";

    // Common aliases
    if (raw === "Esc") return "Escape";
    if (raw === "Del") return "Delete";
    if (raw === " " || raw === "Spacebar" || raw === "Space") return "Space";
    if (raw === "+") return "Plus";
    if (raw === "Клик") return "Click";
    // if (raw === "Ё" || raw === "ё") return "ё";

    if (isMac()) {
      if (raw === "\\" || raw === "Ё" || raw === "ё") return "\\";
    } else {
      if (raw === "`" || raw === "Ё" || raw === "ё") return "`";
    }

    if (raw === "{" || raw === "[") return "BracketLeft";
    if (raw === "}" || raw === "]") return "BracketRight";

    const up = raw.toUpperCase();

    // Primary aliases
    if (
      up === "CTRL" ||
      up === "CONTROL" ||
      up === "CMD" ||
      up === "COMMAND" ||
      up === "META" ||
      up === "OS" ||
      up === "WIN" ||
      raw === "⌘" ||
      raw === "" ||
      raw === PRIMARY
    ) {
      return PRIMARY;
    }

    if (up === "OPTION") return "Alt";

    // Single character
    if (raw.length === 1) return raw.toUpperCase();

    return raw;
  }

  function sortTokens(tokens) {
    const prio = (t) => {
      if (t === PRIMARY) return 1;
      if (t === "Alt") return 2;
      if (t === "Shift") return 3;
      return 4;
    };
    return [...tokens].sort((a, b) => {
      const pa = prio(a), pb = prio(b);
      if (pa !== pb) return pa - pb;
      return String(a).localeCompare(String(b));
    });
  }

  function normalizeCombo(comboRaw) {
    const raw = String(comboRaw || "").trim();
    if (!raw) return "";

    // Historical special-case: Shift + Plus -> "+"
    if (raw === "+") return "+";

    const parts = raw
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(normalizeKeyName)
      .filter(Boolean);

    const normalized = sortTokens(parts);

    // Shift + Plus -> "+"
    if (normalized.length === 2 && normalized.includes("Shift") && normalized.includes("Plus")) {
      return "+";
    }

    return normalized.join("+");
  }

  function buildDefaultConfig() {
    return Object.fromEntries(
      Object.entries(DEFAULTS).map(([action, combo]) => [
        action,
        normalizeCombo(combo),
      ])
    );
  }
  
  function loadSavedConfig() {
    const base = buildDefaultConfig();
  
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
  
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return base;
  
      for (const action of Object.keys(DEFAULTS)) {
        if (Object.prototype.hasOwnProperty.call(saved, action)) {
          base[action] = normalizeCombo(saved[action]);
        }
      }
  
      return base;
    } catch (_) {
      return base;
    }
  }
  
  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (_) {}
  }

  let current = loadSavedConfig();

  function reset() {
    current = buildDefaultConfig();
  
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }
  
  function set(action, combo) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, action)) return;
  
    current[action] = normalizeCombo(combo);
    saveConfig();
  }

  function get(action) {
    return current[action];
  }

  function getAll() {
    return { ...current };
  }

  function findConflicts() {
    const map = new Map();
    const conflicts = new Set();

    

    for (const [action, comboRaw] of Object.entries(current)) {
      const combo = normalizeCombo(comboRaw);
      const arr = map.get(combo) || [];

      // пустой хоткей = не назначен, это не конфликт
  if (!combo) continue;

      arr.push(action);
      map.set(combo, arr);
    }

    for (const actions of map.values()) {
      if (actions.length > 1) actions.forEach((a) => conflicts.add(a));
    }

    return conflicts;
  }

  // Expose a tiny runtime helper so UI can show Ctrl/Cmd.
  function getPlatformInfo() {
    return {
      isMac: isMac(),
      primaryToken: PRIMARY,
      primaryLabel: primaryLabel(),
      altLabel: altLabel(),
    };
  }

  window.hotkeys = {
    DEFAULTS,
    normalizeCombo,
    set,
    get,
    getAll,
    reset,
    findConflicts,
    getPlatformInfo,
  };
})();
