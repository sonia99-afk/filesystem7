const VIEW = {
  SCHEMA: "schema",
  HIERARCHY: "hierarchy",
  AICYCLE: "aicycle",
  TABLE: "table",
  LIST: "list",
  TEXT: "text",
};

let currentView = VIEW.SCHEMA;

const VIEW_ORIENTATION = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};

let viewOrientation = VIEW_ORIENTATION.VERTICAL;

const LEVEL = { COMPANY: 0, PROJECT: 1, DEPT: 2, ROLE: 3, STEP: 20 };

let showOrdinals = true;
let showCaptions = true;

const DEFAULT_NAME = {
  0: 'Уровень 0',
  1: 'Уровень 1',
  2: 'Уровень 2',
  3: 'Уровень 3',
  4: 'Уровень 4',
  5: 'Уровень 5',
  6: 'Уровень 6',
  7: 'Уровень 7',
  8: 'Уровень 8',
  9: 'Уровень 9',
  10: 'Уровень 10',
  11: 'Уровень 11',
  12: 'Уровень 12',
  13: 'Уровень 13',
  14: 'Уровень 14',
  15: 'Уровень 15',
  16: 'Уровень 16',
  17: 'Уровень 17',
  18: 'Уровень 18',
  19: 'Уровень 19',
  20: 'Уровень 20',
};

const uid = () => Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);

function syncViewButtons() {
  document.getElementById("modeStd")?.classList.toggle("is-active", currentView === VIEW.SCHEMA);
  document.getElementById("modeHierarchy")?.classList.toggle("is-active", currentView === VIEW.HIERARCHY);
  document.getElementById("modeAicycle")?.classList.toggle("is-active", currentView === VIEW.AICYCLE);
  document.getElementById("modeTable")?.classList.toggle("is-active", currentView === VIEW.TABLE);
  document.getElementById("modeList")?.classList.toggle("is-active", currentView === VIEW.LIST);
  document.getElementById("modeText")?.classList.toggle("is-active", currentView === VIEW.TEXT);
}

function setCurrentView(view) {
  currentView = view || VIEW.SCHEMA;

  if (currentView === VIEW.AICYCLE) {
    viewOrientation = VIEW_ORIENTATION.HORIZONTAL;
  }

  document.body.classList.toggle("view-hierarchy", currentView === VIEW.HIERARCHY);
  document.body.classList.toggle("view-schema", currentView === VIEW.SCHEMA);

  if (currentView === VIEW.TEXT) {
    setTelegramMode(true);
    syncViewButtons();
    return;
  }

  setTelegramMode(false);
  render();
  syncViewButtons();
}

function syncViewOrientationButtons() {
  document.getElementById("hierarchyHorizontalBtn")?.classList.toggle(
    "is-active",
    viewOrientation === VIEW_ORIENTATION.HORIZONTAL
  );

  document.getElementById("hierarchyVerticalBtn")?.classList.toggle(
    "is-active",
    viewOrientation === VIEW_ORIENTATION.VERTICAL
  );
}

function setViewOrientation(orientation) {
  viewOrientation = orientation || VIEW_ORIENTATION.VERTICAL;
  render();
  syncViewOrientationButtons();
}

function makeNode(level, name) {
  return {
    id: uid(),
    level,
    name: (name || DEFAULT_NAME[level]),
    nameHtml: "",
    captionsBgColor: "",
    captions: [],
    children: []
  };
}

function makeCaption(text = "") {
  return {
    id: uid(),
    text,
    textHtml: ""
  };
}

const root = makeNode(LEVEL.COMPANY, 'Уровень 0');
let selectedId = root.id;
let treeHasFocus = true;

/* =========================
   Undo / Redo
   ========================= */
let undoStack = [];
let redoStack = [];

function snapshot() {
  return JSON.stringify({
    root,
    selectedId,
    treeHasFocus
  });
}

function restore(state) {
  const data = JSON.parse(state);

  window.__suppressCaptionBlurCommit = true;

  root.id = data.root.id;
  root.level = data.root.level;
  root.name = data.root.name;
  root.captionsBgColor = data.root.captionsBgColor || "";
  root.nameHtml = data.root.nameHtml || "";
  root.captions = data.root.captions || [];
  root.children = data.root.children || [];

  selectedId = data.selectedId || root.id;
  treeHasFocus = (typeof data.treeHasFocus === 'boolean') ? data.treeHasFocus : true;

  if (!findWithParent(root, selectedId)) selectedId = root.id;

  renamingId = null;

  render();

  queueMicrotask(() => {
    window.__suppressCaptionBlurCommit = false;
  });
}

function pushHistory() {
  undoStack.push(snapshot());
  redoStack.length = 0;
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  const prev = undoStack.pop();
  restore(prev);
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  const next = redoStack.pop();
  restore(next);
}

// layout-independent hotkeys
function isMod(e) {
  return (e.metaKey || e.ctrlKey) && !e.altKey;
}

function isUndoHotkey(e) {
  if (!window.hotkeys?.get) return false;
  return isHotkey(e, "undo");
}

function isRedoHotkey(e) {
  if (!window.hotkeys?.get) return false;
  return isHotkey(e, "redo");
}

/* =========================
   Hotkeys: modifiers + ONE key
   ========================= */

function isTextEditingElement(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = String(el.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  return false;
}

function getPlatformInfo() {
  return window.hotkeys?.getPlatformInfo?.() || { isMac: false, primaryToken: "Primary" };
}

function normalizeBaseKeyFromEvent(e) {
  if (!e) return "";

  const k = String(e.key || "");
  if (k === "Shift" || k === "Alt" || k === "Control" || k === "Meta" || k === "OS") return "";

  const code = String(e.code || "");
  if (code.startsWith("Key") && code.length === 4) return code.slice(3).toUpperCase();
  if (code.startsWith("Digit") && code.length === 6) return code.slice(5);
  if (code.startsWith("Numpad") && code.length === 7 && /[0-9]/.test(code.slice(6))) return code.slice(6);

  if (k === " " || k === "Spacebar") return "Space";
  if (k === "Esc") return "Escape";
  if (k === "+") return "Plus";

  if (code === "BracketLeft") return "BracketLeft";
if (code === "BracketRight") return "BracketRight";

  if (k.length === 1) return k.toUpperCase();
  return k;
}

function comboFromKeyEvent(e) {
  const { isMac, primaryToken } = getPlatformInfo();

  const base = normalizeBaseKeyFromEvent(e);
  if (!base) return "";

  const tokens = [];
  const primaryDown = isMac ? !!e.metaKey : !!e.ctrlKey;
  if (primaryDown) tokens.push(primaryToken);
  if (e.altKey) tokens.push("Alt");
  if (e.shiftKey) tokens.push("Shift");
  tokens.push(base);

  if (tokens.length === 2 && tokens.includes("Shift") && tokens.includes("Plus")) return "+";

  return window.hotkeys?.normalizeCombo?.(tokens.join("+")) || tokens.join("+");
}

function isHotkey(e, action) {
  const wantRaw = window.hotkeys?.get?.(action);
  if (!wantRaw) return false;

  if (e.repeat) return false;

  const ae = document.activeElement;
  if (isTextEditingElement(ae)) return false;
  if (ae?.classList?.contains?.("edit")) return false;
  if (ae?.classList?.contains?.("tg-export")) return false;

  const haveRaw = comboFromKeyEvent(e);
  if (!haveRaw) return false;

  const normalize = window.hotkeys?.normalizeCombo;
  const want = normalize ? normalize(wantRaw) : wantRaw;
  const have = normalize ? normalize(haveRaw) : haveRaw;

  return have === want;
}

function comboFromMouseEvent(e, baseToken) {
  const { isMac, primaryToken } = getPlatformInfo();

  const tokens = [];
  const primaryDown = isMac ? !!e.metaKey : !!e.ctrlKey;
  if (primaryDown) tokens.push(primaryToken);
  if (e.altKey) tokens.push("Alt");
  if (e.shiftKey) tokens.push("Shift");
  tokens.push(baseToken);

  return window.hotkeys?.normalizeCombo?.(tokens.join("+")) || tokens.join("+");
}

function isMouseHotkey(e, action, baseToken) {
  const wantRaw = window.hotkeys?.get?.(action);
  if (!wantRaw) return false;

  const ae = document.activeElement;
  if (isTextEditingElement(ae)) return false;
  if (ae?.classList?.contains?.("edit")) return false;
  if (ae?.classList?.contains?.("tg-export")) return false;

  const haveRaw = comboFromMouseEvent(e, baseToken);
  const normalize = window.hotkeys?.normalizeCombo;
  const want = normalize ? normalize(wantRaw) : wantRaw;
  const have = normalize ? normalize(haveRaw) : haveRaw;

  return have === want;
}

/* ========================= */

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function cssEscape(s) {
  const v = String(s);
  if (window.CSS && typeof CSS.escape === 'function') return CSS.escape(v);
  return v.replace(/[^a-zA-Z0-9_\-]/g, '\\$&');
}

// ===== ORDINAL INDICATOR =====
function ordinalPathToString(path) {
  return Array.isArray(path) ? path.join(".") : "";
}

function buildOrdinalBadge(path) {
  const s = ordinalPathToString(path);
  if (!s) return null;

  const wrap = document.createElement("span");
  wrap.className = "ordinal-badge";

  const left = document.createElement("span");
  left.textContent = "[";
  left.className = "ordinal-bracket";

  const num = document.createElement("span");
  num.textContent = s;
  num.className = "ordinal-number";

  const right = document.createElement("span");
  right.textContent = "]";
  right.className = "ordinal-bracket";

  wrap.appendChild(left);
  wrap.appendChild(num);
  wrap.appendChild(right);

  return wrap;
}

function findWithParent(node, id, parent = null) {
  if (node.id === id) return { node, parent };
  for (const ch of node.children) {
    const r = findWithParent(ch, id, node);
    if (r) return r;
  }
  return null;
}

function canHaveChild(node) {
  return node.level < LEVEL.STEP;
}

function flatten() {
  const out = [];
  (function walk(n) {
    out.push(n.id);
    for (const ch of n.children) walk(ch);
  })(root);
  return out;
}

function flattenWithLevels() {
  const out = [];
  (function walk(n) {
    out.push({ id: n.id, level: n.level });
    for (const ch of n.children) walk(ch);
  })(root);
  return out;
}

function parentOf(id) {
  const r = findWithParent(root, id);
  return r && r.parent ? r.parent.id : null;
}

function firstChildOf(id) {
  const r = findWithParent(root, id);
  if (!r) return null;
  return (r.node.children && r.node.children.length) ? r.node.children[0].id : null;
}

function firstDeeperAfter(id) {
  const flat = flattenWithLevels();
  const idx = flat.findIndex(x => x.id === id);
  if (idx < 0) return null;
  const baseLevel = flat[idx].level;
  for (let i = idx + 1; i < flat.length; i++) {
    if (flat[i].level > baseLevel) return flat[i].id;
  }
  return null;
}

/* ======== Tree mutations (with history) ======== */

function addChild(parentId) {
  const r = findWithParent(root, parentId);
  if (!r) return;
  if (!canHaveChild(r.node)) return;

  pushHistory();

  const child = makeNode(r.node.level + 1);
  r.node.children.push(child);
  selectedId = child.id;
  treeHasFocus = true;
  render();
  setTimeout(() => startRename(child.id), 0);
}

function addCaption(nodeId) {
  const r = findWithParent(root, nodeId);
  if (!r) return;

  if (!Array.isArray(r.node.captions)) {
    r.node.captions = [];
  }

  selectedId = nodeId;
  treeHasFocus = true;

  // если подпись уже есть — просто редактируем первую
  if (r.node.captions.length > 0) {
    const cap = r.node.captions[0];

    render();

    setTimeout(() => {
      startCaptionEdit(nodeId, cap.id);
    }, 0);

    return;
  }

  // если подписи нет — создаём одну
  pushHistory();

  const cap = {
    id: uid(),
    text: "",
    textHtml: ""
  };

  r.node.captions = [cap];

  render();

  setTimeout(() => {
    startCaptionEdit(nodeId, cap.id, { isNew: true });
  }, 0);
}

function addSibling(targetId) {
  if (targetId === root.id) {
    addChild(root.id);
    return;
  }

  const r = findWithParent(root, targetId);
  if (!r || !r.parent) return;

  pushHistory();

  const parent = r.parent;
  const idx = parent.children.findIndex(x => x.id === targetId);
  const sib = makeNode(r.node.level);

  const insertAt = (idx >= 0) ? idx + 1 : parent.children.length;
  parent.children.splice(insertAt, 0, sib);
  selectedId = sib.id;
  treeHasFocus = true;
  render();
  setTimeout(() => startRename(sib.id), 0);
}

function removeSelected() {
  if (!selectedId) return;
  if (selectedId === root.id) return;

  const r = findWithParent(root, selectedId);
  if (!r || !r.parent) return;

  const parent = r.parent;
  const arr = parent.children;
  const idx = arr.findIndex(x => x.id === selectedId);
  if (idx < 0) return;

  pushHistory();

  let nextSelected = null;

  if (idx + 1 < arr.length) {
    nextSelected = arr[idx + 1].id;
  } else if (idx - 1 >= 0) {
    nextSelected = arr[idx - 1].id;
  } else {
    nextSelected = parent.id;
  }

  parent.children.splice(idx, 1);

  selectedId = nextSelected;
  treeHasFocus = true;
  render();
}

function moveWithinParent(dir) {
  if (!selectedId) return;
  if (selectedId === root.id) return;

  const r = findWithParent(root, selectedId);
  if (!r || !r.parent) return;

  const arr = r.parent.children;
  const idx = arr.findIndex(x => x.id === selectedId);
  if (idx < 0) return;

  const j = idx + dir;
  if (j < 0 || j >= arr.length) return;

  pushHistory();

  const tmp = arr[idx];
  arr[idx] = arr[j];
  arr[j] = tmp;

  render();
}

function collectSubtreeIds(node) {
  const out = [];

  (function walk(n) {
    out.push(n.id);
    for (const ch of (n.children || [])) walk(ch);
  })(node);

  return out;
}

function moveNodeRelativeToTarget(id, targetId, insertMode) {
  if (!id || !targetId) return false;
  if (id === root.id) return false;
  if (id === targetId) return false;
  if (insertMode !== "before" && insertMode !== "after") return false;

  const movingInfo = findWithParent(root, id);
  const targetInfo = findWithParent(root, targetId);

  if (!movingInfo || !targetInfo) return false;
  if (!movingInfo.parent) return false;

  // нельзя вставить относительно собственного потомка
  let cur = targetId;
  while (cur) {
    const p = parentOf(cur);
    if (!p) break;
    if (p === id) return false;
    cur = p;
  }

  const wasDefault =
    String(movingInfo.node.name || "").trim() ===
    String(DEFAULT_NAME[movingInfo.node.level] || "").trim();

  pushHistory();

  // удаляем из старого родителя
  movingInfo.parent.children = (movingInfo.parent.children || []).filter(
    (n) => n.id !== id
  );

  // после удаления ищем target заново
  const freshTarget = findWithParent(root, targetId);
  if (!freshTarget || !freshTarget.parent) {
    undo();
    return false;
  }

  const destinationParent = freshTarget.parent;
  destinationParent.children ||= [];

  const targetIdx = destinationParent.children.findIndex((n) => n.id === targetId);
  if (targetIdx < 0) {
    undo();
    return false;
  }

  const insertAt = insertMode === "before" ? targetIdx : targetIdx + 1;
  const newLevel = freshTarget.node.level;
  const delta = newLevel - movingInfo.node.level;

  if (delta !== 0) {
    if (typeof shiftSubtreeLevel === "function") {
      const ok = shiftSubtreeLevel(movingInfo.node, delta);
      if (!ok) {
        undo();
        return false;
      }
    } else {
      movingInfo.node.level = newLevel;
    }
  }

  if (wasDefault) {
    const def = DEFAULT_NAME[movingInfo.node.level];
    if (def) movingInfo.node.name = def;
  }

  destinationParent.children.splice(insertAt, 0, movingInfo.node);

  selectedId = id;
  treeHasFocus = true;
  render();
  return true;
}

function moveByVisibleOrder(dir) {
  if (!selectedId) return false;
  if (selectedId === root.id) return false;
  if (dir !== -1 && dir !== 1) return false;

  const flat = flatten();
  const idx = flat.indexOf(selectedId);
  if (idx < 0) return false;

  if (dir === -1) {
    const prevId = flat[idx - 1];
    if (!prevId) return false;
    return moveNodeRelativeToTarget(selectedId, prevId, "before");
  }

  // Вниз: игнорируем собственное поддерево
  let nextId = null;

  for (let i = idx + 1; i < flat.length; i++) {
    const candidateId = flat[i];

    let cur = candidateId;
    let isDescendant = false;

    while (cur) {
      const p = parentOf(cur);
      if (!p) break;
      if (p === selectedId) {
        isDescendant = true;
        break;
      }
      cur = p;
    }

    if (!isDescendant) {
      nextId = candidateId;
      break;
    }
  }

  if (!nextId) return false;

  const nextInfo = findWithParent(root, nextId);
  if (!nextInfo) return false;

  const nextChildren = Array.isArray(nextInfo.node.children)
    ? nextInfo.node.children
    : [];

  // Если у следующего невложенного элемента есть дети —
  // встаём на уровень его детей первым
  if (nextChildren.length > 0) {
    const firstChildId = nextChildren[0].id;
    return moveNodeRelativeToTarget(selectedId, firstChildId, "before");
  }

  // Иначе просто после него
  return moveNodeRelativeToTarget(selectedId, nextId, "after");
}

function indentNode(id) {
  if (!id || id === root.id) return;

  const r = findWithParent(root, id);
  if (!r || !r.parent) return;

  const siblings = r.parent.children;
  const idx = siblings.findIndex(x => x.id === id);
  if (idx <= 0) return;

  const newParent = siblings[idx - 1];
  if (!canHaveChild(newParent)) return;

  const maxL = getMaxLevelInSubtree(r.node);
  if (maxL + 1 > LEVEL.STEP) return;

  pushHistory();

  if (!shiftSubtreeLevel(r.node, +1)) return;

  siblings.splice(idx, 1);
  newParent.children.push(r.node);

  selectedId = id;
  treeHasFocus = true;
  render();
}

function outdentNode(id) {
  if (!id || id === root.id) return;

  const r = findWithParent(root, id);
  if (!r || !r.parent) return;

  const parent = r.parent;
  const gp = findWithParent(root, parent.id)?.parent;
  if (!gp) return;

  pushHistory();

  if (!shiftSubtreeLevel(r.node, -1)) return;

  parent.children = parent.children.filter(x => x.id !== id);

  const pIdx = gp.children.findIndex(x => x.id === parent.id);
  gp.children.splice(pIdx + 1, 0, r.node);

  selectedId = id;
  treeHasFocus = true;
  render();
}

function htmlPlainText(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || "").trim();
}

function replaceTextInsideHtmlPreservingMarkup(html, nextText) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";

  const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  if (!textNodes.length) return "";

  textNodes[0].nodeValue = nextText;

  for (let i = 1; i < textNodes.length; i++) {
    const n = textNodes[i];
    if (n.parentNode) n.parentNode.removeChild(n);
  }

  return tmp.innerHTML;
}

function shiftSubtreeLevel(node, delta) {
  const oldLevel = node.level;
  const newLevel = oldLevel + delta;

  if (newLevel < LEVEL.COMPANY || newLevel > LEVEL.STEP) return false;

  const oldDefault = DEFAULT_NAME[oldLevel];
  const newDefault = DEFAULT_NAME[newLevel];

  const plainName = String(node.name || "").trim();
  const htmlText = node.nameHtml ? htmlPlainText(node.nameHtml) : "";

  const shouldRenameDefault =
    plainName === oldDefault || htmlText === oldDefault;

  if (shouldRenameDefault) {
    node.name = newDefault;

    if (node.nameHtml) {
      node.nameHtml = replaceTextInsideHtmlPreservingMarkup(
        node.nameHtml,
        newDefault
      );
    }
  }

  node.level = newLevel;

  for (const ch of (node.children || [])) {
    const ok = shiftSubtreeLevel(ch, delta);
    if (!ok) return false;
  }

  return true;
}

function getMaxLevelInSubtree(node) {
  let max = node.level;
  for (const ch of (node.children || [])) {
    max = Math.max(max, getMaxLevelInSubtree(ch));
  }
  return max;
}

/* ======== Navigation ======== */

// function moveSelection(dir) {
//   const displayRoot =
//     window.objectFocus?.getFocusedRootNode?.() || root;

//   const out = [];

//   (function walk(n) {
//     out.push(n.id);
//     for (const ch of (n.children || [])) walk(ch);
//   })(displayRoot);

//   const idx = out.indexOf(selectedId);
//   if (idx < 0) {
//     selectedId = displayRoot.id;
//     treeHasFocus = true;
//     render();
//     return;
//   }

//   const next = out[idx + dir];
//   if (!next) return;

//   selectedId = next;
//   treeHasFocus = true;
//   render();
// }

function moveSelection(dir) {
  const flat = flatten();
  const idx = flat.indexOf(selectedId);
  if (idx < 0) return;

  const next = flat[idx + dir];
  if (!next) return;

  if (!window.objectFocus?.isInsideFocusedRoot?.(next)) return;

  selectedId = next;
  treeHasFocus = true;
  render();
}

function goParent(fromId) {
  const p = parentOf(fromId);
  if (!p) return;

  if (!window.objectFocus?.isInsideFocusedRoot?.(p)) return;

  selectedId = p;
  treeHasFocus = true;
  render();
}

function goDeeper(fromId) {
  const direct = firstChildOf(fromId);

  if (direct && window.objectFocus?.isInsideFocusedRoot?.(direct)) {
    selectedId = direct;
    treeHasFocus = true;
    render();
    return;
  }

  const deeper = firstDeeperAfter(fromId);

  if (!deeper) return;
  if (!window.objectFocus?.isInsideFocusedRoot?.(deeper)) return;

  selectedId = deeper;
  treeHasFocus = true;
  render();
}

/* ======== Render ======== */

// function focusSelectedRow() {
//   if (!treeHasFocus) return;
//   const host = document.getElementById('tree');
//   const r = host.querySelector(`.row[data-id="${cssEscape(selectedId)}"]`);
//   if (!r) return;
//   r.focus({ preventScroll: true });
// }

function focusSelectedRow() {
  if (!treeHasFocus) return;

  const host = document.getElementById("tree");
  const r = host.querySelector(`.row[data-id="${cssEscape(selectedId)}"]`);

  if (!r) return;

  r.focus({ preventScroll: true });
}

let __selectedScrollRaf = null;

function scrollSelectedIntoView() {
  if (!selectedId) return;

  const tree = document.getElementById("tree");
  if (!tree) return;

  if (__selectedScrollRaf) {
    cancelAnimationFrame(__selectedScrollRaf);
  }

  __selectedScrollRaf = requestAnimationFrame(() => {
    __selectedScrollRaf = null;

    const safeId = cssEscape(selectedId);

    const el =
      tree.querySelector(`.row[data-id="${safeId}"]`) ||
      tree.querySelector(`[data-id="${safeId}"]`);

    if (!el || !el.getClientRects().length) return;

    el.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    });
  });
}

function syncProjectsSidebar() {
  const firstProjectItem = document.querySelector('.projects-list .project-item');
  if (!firstProjectItem) return;

  const projectTitle = (root?.name || '').trim() || DEFAULT_NAME[LEVEL.COMPANY] || 'Проект';
  firstProjectItem.textContent = projectTitle;
  firstProjectItem.title = projectTitle;
}

function initProjectsSidebar() {
  const addButton = document.querySelector('.project-add');
  const projectsList = document.querySelector('.projects-list');

  if (!addButton || !projectsList) return;
  if (addButton.dataset.bound === '1') return;

  addButton.dataset.bound = '1';
  addButton.addEventListener('click', () => {
    const projectItem = document.createElement('button');
    projectItem.className = 'project-item';
    projectItem.type = 'button';
    projectItem.textContent = 'Новый проект';
    projectItem.title = 'Проект';
    projectsList.appendChild(projectItem);
  });
}

function renderSchemaView() {
  syncProjectsSidebar();

  const host = document.getElementById('tree');
  host.innerHTML = '';

  const displayRoot =
    window.objectFocus?.getFocusedRootNode?.() || root;

  const displayRootOrdinalPath =
    window.objectFocus?.getFocusedRootOrdinalPath?.() || [];

    const ul = document.createElement('ul');
    ul.dataset.level = String(displayRoot.level);
    
    if (displayRoot.id !== root.id) {
      ul.classList.add("focus-root");
    }

  ul.appendChild(
    renderNode(displayRoot, displayRootOrdinalPath, {
      suppressOwnOrdinal: displayRoot.id !== root.id,
      forceRootClass: displayRoot.id !== root.id,
    })
  );

  const levelHeadersBlock =
    window.levelHeaders?.buildHeaderRowForSchema?.()
    || window.levelHeaders?.buildHeaderCascadeForSchema?.();

    const levelHeadersColumn =
    window.levelHeaders?.buildColumnStackForSchema?.()
    || window.levelHeaders?.buildColumnCascadeForSchema?.();

  if (levelHeadersBlock) {
    host.appendChild(levelHeadersBlock);
  }

  if (levelHeadersColumn) {
    const contentWrap = document.createElement("div");
    contentWrap.className = "schema-with-level-column";

    contentWrap.appendChild(levelHeadersColumn);
    contentWrap.appendChild(ul);

    host.appendChild(contentWrap);
  } else {
    host.appendChild(ul);
  }

  applyCaptionOrdinalOffsets();
  layoutTrunks();
  layoutCollapseColumn();
  layoutLevelCollapseBar();

  requestAnimationFrame(() => {
    window.levelHeaders?.alignHeaderRowForSchema?.();
    window.levelHeaders?.layoutColumnCascadeLines?.();
  });

  window.objectFocus?.renderBreadcrumbs?.();

  if (treeHasFocus) focusSelectedRow();

  const rid = consumeRenameRequest?.();
  if (rid) startRename(rid);
}

// function render() {
//   if (currentView === VIEW.HIERARCHY) {
//     if (hierarchyOrientation === HIERARCHY_ORIENTATION.HORIZONTAL) {
//       window.renderHierarchyHorizontalView?.();
//     } else {
//       window.renderHierarchyView?.();
//     }
  
//     syncHierarchyOrientationButtons();
//     return;
//   }

//   renderSchemaView();
// }

function render() {
  updateDirectionButtons();

  if (currentView === VIEW.HIERARCHY) {
    if (viewOrientation === VIEW_ORIENTATION.HORIZONTAL) {
      window.renderHierarchyHorizontalView?.();
    } else {
      window.renderHierarchyView?.();
    }

    syncViewOrientationButtons();
    scrollSelectedIntoView();
    return;
  }

  if (currentView === VIEW.AICYCLE) {
    if (viewOrientation === VIEW_ORIENTATION.VERTICAL) {
      window.renderIcicleVerticalView?.();
    } else {
      window.renderIcicleHorizontalView?.();
    }

    syncViewOrientationButtons();
    scrollSelectedIntoView();
    return;
  }

  if (currentView === VIEW.TABLE) {
    window.renderTableView?.();
    scrollSelectedIntoView();
    return;
  }

  if (currentView === VIEW.LIST) {
    window.renderListView?.();
    scrollSelectedIntoView();
    return;
  }

  renderSchemaView();
  scrollSelectedIntoView();
}

function isTreeLocked() {
  return window.hotkeysMode === "custom";
}

function makeBtn(midText, onClick) {
  const b = document.createElement('span');
  b.className = 'btn';

  const l = document.createElement('span');
  l.className = 'br';
  l.textContent = '[';

  const m = document.createElement('span');
  m.className = 'mid';
  m.textContent = midText;

  const r = document.createElement('span');
  r.className = 'br';
  r.textContent = ']';

  b.append(l, m, r);

  b.addEventListener('click', (e) => {
    if (isTreeLocked()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick(e);
  });

  return b;
}



function handleRowMouseHotkeys(e, n, baseToken) {
  if (isTreeLocked()) return false;

  if (isMouseHotkey(e, "redoClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    treeHasFocus = true;
    redo();
    return true;
  }

  if (isMouseHotkey(e, "undoClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    treeHasFocus = true;
    undo();
    return true;
  }

  if (isMouseHotkey(e, "deleteClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    selectedId = n.id;
    treeHasFocus = true;
    removeSelected();
    return true;
  }

  if (isMouseHotkey(e, "addSiblingClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    selectedId = n.id;
    treeHasFocus = true;
    addSibling(n.id);
    return true;
  }

  if (isMouseHotkey(e, "addChildClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    selectedId = n.id;
    treeHasFocus = true;
    addChild(n.id);
    return true;
  }

  if (isMouseHotkey(e, "renameClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    selectedId = n.id;
    treeHasFocus = true;
    render();
    startRename(n.id);
    return true;
  }

  if (isMouseHotkey(e, "navClick", baseToken)) {
    e.preventDefault();
    e.stopPropagation();
    selectedId = n.id;
    treeHasFocus = true;
    render();
    return true;
  }

  return false;
}

function applyCaptionOrdinalOffsets() {
  const tree = document.getElementById("tree");
  if (!tree) return;

  const rows = tree.querySelectorAll(".row[data-id]");

  rows.forEach((row) => {
    const li = row.closest("li");
    if (!li) return;

    const caps = li.querySelector(":scope > .captions");
    if (!caps) return;

    // если нумерация выключена — сбрасываем
    if (!showOrdinals || !document.body.classList.contains("ordinals-on")) {
      caps.style.marginLeft = "0px";
      return;
    }

    const badge = row.querySelector(":scope > .ordinal-badge");
    if (!badge) {
      caps.style.marginLeft = "0px";
      return;
    }

    const badgeBox = badge.getBoundingClientRect();
    const badgeStyle = getComputedStyle(badge);
    const mr = parseFloat(badgeStyle.marginRight) || 0;

    const shift = badgeBox.width + mr;
    caps.style.marginLeft = `${Math.ceil(shift)}px`;
  });
}

function renderCaptions(node, li) {
  if (!showCaptions || !Array.isArray(node.captions) || !node.captions.length) {
    return;
  }

  const caps = document.createElement("div");
  caps.className = "captions";

  if (node.captionsBgColor) {
    caps.style.backgroundColor = node.captionsBgColor;
  }

  for (const c of node.captions) {
    const cap = document.createElement("div");

    const isMultiline =
      (c.text || "").includes("\n") ||
      (c.textHtml || "").includes("<br>");

    cap.className = "caption" + (isMultiline ? " caption-multiline" : "");
    cap.dataset.nodeId = node.id;
    cap.dataset.captionId = c.id;

    if (c.textHtml) cap.innerHTML = c.textHtml;
    else cap.textContent = c.text || "";

    cap.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      selectedId = node.id;
      treeHasFocus = true;
      startCaptionEdit(node.id, c.id);
    });

    caps.appendChild(cap);
  }

  li.appendChild(caps);
}

function renderNode(n, ordinalPath = [], options = {}) {
  const li = document.createElement('li');

  if (n.id === root.id || options.forceRootClass) {
    li.classList.add('root');
  }

  const anchor = document.createElement('span');
  anchor.className = 'anchor';
  li.appendChild(anchor);

  const row = document.createElement('span');
  row.dataset.id = n.id;
  row.className = 'row' + ((treeHasFocus && n.id === selectedId) ? ' sel' : '');
  row.tabIndex = 0;

  const label = document.createElement('span');
label.className = 'label';

// ← добавили индекс
if (showOrdinals && !options.suppressOwnOrdinal) {
  const ordinalBadge = buildOrdinalBadge(ordinalPath);
  if (ordinalBadge) {
    row.appendChild(ordinalBadge);
  }
}

if (n.nameHtml) label.innerHTML = n.nameHtml;
else label.textContent = n.name || '';

row.appendChild(label);

  const act = document.createElement('span');
  act.className = 'act';

  {
    const plus = makeBtn('+', (e) => {
      e.stopPropagation();
      selectedId = n.id;
      addSibling(n.id);
    });
    act.appendChild(plus);
  }

  {
    const rename = makeBtn('..', (e) => {
      e.stopPropagation();
      selectedId = n.id;
      treeHasFocus = true;
      render();
      startRename(n.id);
    });
    act.appendChild(rename);
  }

  if (canHaveChild(n)) {
    const child = makeBtn('>', (e) => {
      e.stopPropagation();
      selectedId = n.id;
      addChild(n.id);
    });
    act.appendChild(child);
  }

  if (n.id !== root.id) {
    const del = makeBtn('x', (e) => {
      e.stopPropagation();
      selectedId = n.id;
      removeSelected();
    });
    act.appendChild(del);
  } else {
    const lock = document.createElement('span');
    lock.className = 'mut';
    lock.style.marginLeft = '6px';
    act.appendChild(lock);
  }

  row.appendChild(act);

  row.addEventListener('click', (e) => {
    handleRowMouseHotkeys(e, n, "Click");
  });

  row.addEventListener('dblclick', (e) => {
    handleRowMouseHotkeys(e, n, "DblClick");
  });

  row.addEventListener('keydown', (e) => {
    if (isTreeLocked()) {
      return;
    }

    if (isUndoHotkey(e)) {
      e.preventDefault();
      undo();
      return;
    }

    if (isRedoHotkey(e)) {
      e.preventDefault();
      redo();
      return;
    }

    if (isHotkey(e, "indent")) {
      e.preventDefault();
      selectedId = n.id;
      indentNode(n.id);
      return;
    }

    if (isHotkey(e, "outdent")) {
      e.preventDefault();
      selectedId = n.id;
      outdentNode(n.id);
      return;
    }

    if (isHotkey(e, "navLeft")) {
      e.preventDefault();
      goParent(n.id);
      return;
    }

    if (isHotkey(e, "navRight")) {
      e.preventDefault();
      goDeeper(n.id);
      return;
    }

    if (isHotkey(e, "navUp")) {
      e.preventDefault();
      selectedId = n.id;
      moveSelection(-1);
      return;
    }

    if (isHotkey(e, "navDown")) {
      e.preventDefault();
      selectedId = n.id;
      moveSelection(+1);
      return;
    }

    if (isHotkey(e, "moveUp")) {
      e.preventDefault();
      selectedId = n.id;
      moveByVisibleOrder(-1);
      return;
    }
    
    if (isHotkey(e, "moveDown")) {
      e.preventDefault();
      selectedId = n.id;
      moveByVisibleOrder(+1);
      return;
    }

    if (isHotkey(e, "rename")) {
      e.preventDefault();
      selectedId = n.id;
      treeHasFocus = true;
      render();
      startRename(n.id);
      return;
    }

    if (isHotkey(e, "delete")) {
      e.preventDefault();
      selectedId = n.id;
      removeSelected();
      return;
    }

    if (isHotkey(e, "addChild")) {
      e.preventDefault();
      selectedId = n.id;
      addChild(n.id);
      return;
    }

    if (isHotkey(e, "addSibling")) {
      e.preventDefault();
    
      const focusedRootId = window.objectFocus?.getFocusedRootId?.();
      const isFocusedRoot = !!focusedRootId && focusedRootId === n.id;
    
      selectedId = n.id;
    
      if (isFocusedRoot) {
        addChild(n.id);
      } else {
        addSibling(n.id);
      }
    
      return;
    }

    if (isHotkey(e, "addCaption")) {
      e.preventDefault();
      addCaption(selectedId);
      return;
    }
  });

  li.appendChild(row);

  renderCaptions(n, li);

  const collapsed = window.collapseNodes?.isCollapsed(n.id);

if (
  n.children &&
  n.children.length &&
  !collapsed
) {
    const ul = document.createElement('ul');
    ul.dataset.level = String(n.level + 1);
    n.children.forEach((ch, index) => {
      ul.appendChild(renderNode(ch, [...ordinalPath, index + 1]));
    });
    li.appendChild(ul);
  }

  return li;
}

/* ======== layout lines ======== */
function layoutCollapseColumn() {
  const tree = document.getElementById("tree");
  if (!tree) return;

  tree.querySelectorAll(".collapse-col").forEach((el) => el.remove());

  const treeBox = tree.getBoundingClientRect();
  const rows = Array.from(tree.querySelectorAll(".row[data-id]"))
  .filter((row) => {
    const found = findWithParent(root, row.dataset.id);
    return !!found?.node?.children?.length;
  });

  rows.forEach((row) => {
    const id = row.dataset.id;
  
    const col = document.createElement("button");
    col.type = "button";
    col.className = "collapse-col";
    col.dataset.id = id;

    row.addEventListener("mouseenter", () => {
      col.classList.add("is-visible");
    });
    
    row.addEventListener("mouseleave", () => {
      if (!col.matches(":hover")) {
        col.classList.remove("is-visible");
      }
    });
    
    col.addEventListener("mouseleave", () => {
      col.classList.remove("is-visible");
    });
  
    col.textContent =
      window.collapseNodes?.isCollapsed?.(id) ? "[+]" : "[-]";
  
    col.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
  
      window.collapseNodes?.toggle?.(id);
    });
  
    const rowBox = row.getBoundingClientRect();
    col.style.top = `${Math.round(rowBox.top - treeBox.top)}px`;
  
    tree.appendChild(col);
  });
}

function layoutLevelCollapseBar() {
  const tree = document.getElementById("tree");
  if (!tree) return;

  tree.querySelector(".level-collapse-bar")?.remove();

  const levels = new Set();

  (function walk(node) {
    if (!node) return;

    if (node.children?.length) {
      levels.add(node.level);
    }

    (node.children || []).forEach(walk);
  })(root);

  if (!levels.size) return;

  const bar = document.createElement("div");
  bar.className = "level-collapse-bar";

  [...levels].sort((a, b) => a - b).forEach((level) => {
    const isCollapsed =
      window.collapseNodes?.isLevelCollapsed?.(level);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "level-collapse-btn";

    btn.textContent = isCollapsed ? "[+]" : "[-]";

    btn.title = isCollapsed
      ? `Развернуть уровень ${level}`
      : `Свернуть уровень ${level}`;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (window.collapseNodes?.isLevelCollapsed?.(level)) {
        window.collapseNodes?.expandLevel?.(level);
      } else {
        window.collapseNodes?.collapseLevel?.(level);
      }
    });

    bar.appendChild(btn);
  });

  tree.prepend(bar);
}

function layoutTrunks() {
  window.schemaLines?.layout?.();
}

/* ======== focus / global hotkeys ======== */

document.getElementById('tree').addEventListener('click', (e) => {
  if (e.target.closest('.row')) return;
  treeHasFocus = false;
  const ae = document.activeElement;
  if (ae && ae.classList && ae.classList.contains('row')) ae.blur();
  render();
});

window.addEventListener('keydown', (e) => {
  if (isTreeLocked()) return;

  const active = document.activeElement;
  const isRow = active && active.classList && active.classList.contains('row');
  const isEditing =
    active &&
    active.classList &&
    active.classList.contains('edit') &&
    (active.tagName === 'INPUT' || active.isContentEditable);

  if (isRow || isEditing) return;
  if (!treeHasFocus) return;
  if (!selectedId) return;

  if (isUndoHotkey(e)) {
    e.preventDefault();
    undo();
    return;
  }

  if (isRedoHotkey(e)) {
    e.preventDefault();
    redo();
    return;
  }

  if (isHotkey(e, "indent")) {
    e.preventDefault();
    indentNode(selectedId);
    return;
  }

  if (isHotkey(e, "outdent")) {
    e.preventDefault();
    outdentNode(selectedId);
    return;
  }

  if (isHotkey(e, "navLeft")) {
    e.preventDefault();
    goParent(selectedId);
    return;
  }

  if (isHotkey(e, "navRight")) {
    e.preventDefault();
    goDeeper(selectedId);
    return;
  }

  if (isHotkey(e, "navUp")) {
    e.preventDefault();
    moveSelection(-1);
    return;
  }

  if (isHotkey(e, "navDown")) {
    e.preventDefault();
    moveSelection(+1);
    return;
  }

  if (isHotkey(e, "moveUp")) {
    e.preventDefault();
    moveByVisibleOrder(-1);
    return;
  }
  
  if (isHotkey(e, "moveDown")) {
    e.preventDefault();
    moveByVisibleOrder(+1);
    return;
  }

  if (isHotkey(e, "rename")) {
    e.preventDefault();
    render();
    startRename(selectedId);
    return;
  }

  if (isHotkey(e, "delete")) {
    e.preventDefault();
    removeSelected();
    return;
  }

  if (isHotkey(e, "addCaption")) {
    e.preventDefault();
    addCaption(selectedId);
    return;
  }

  if (isHotkey(e, "addChild")) {
    e.preventDefault();
    addChild(selectedId);
    return;
  }

  if (isHotkey(e, "addSibling")) {
    e.preventDefault();
  
    const focusedRootId = window.objectFocus?.getFocusedRootId?.();
    const isFocusedRoot =
      !!focusedRootId && focusedRootId === selectedId;
  
    if (isFocusedRoot) {
      addChild(selectedId);
    } else {
      addSibling(selectedId);
    }
  
    return;
  }
});

/* ======== tests ======== */

function assert(cond, msg) {
  if (!cond) throw new Error('TEST FAIL: ' + msg);
}

function runTests() {
  const tRoot = makeNode(LEVEL.COMPANY, 'Проект');

  function tFind(id) {
    return findWithParent(tRoot, id);
  }

  function tAddChild(pid) {
    const r = tFind(pid);
    if (!r) return null;
    if (!canHaveChild(r.node)) return null;
    const child = makeNode(r.node.level + 1);
    r.node.children.push(child);
    return child.id;
  }

  function tAddSibling(tid) {
    if (tid === tRoot.id) return tAddChild(tRoot.id);
    const r = tFind(tid);
    if (!r || !r.parent) return null;
    const idx = r.parent.children.findIndex(x => x.id === tid);
    const sib = makeNode(r.node.level);
    r.parent.children.splice(idx + 1, 0, sib);
    return sib.id;
  }

  function tFlattenWL() {
    const out = [];
    (function walk(n) {
      out.push({ id: n.id, level: n.level });
      for (const ch of n.children) walk(ch);
    })(tRoot);
    return out;
  }

  function tFirstDeeperAfter(id) {
    const flat = tFlattenWL();
    const idx = flat.findIndex(x => x.id === id);
    if (idx < 0) return null;
    const base = flat[idx].level;
    for (let i = idx + 1; i < flat.length; i++) {
      if (flat[i].level > base) return flat[i].id;
    }
    return null;
  }

  assert(tRoot.level === LEVEL.COMPANY, 'root is company');

  const p1 = tAddSibling(tRoot.id);
  assert(!!p1, 'project added under root');

  const p2 = tAddSibling(p1);
  assert(!!p2, 'project sibling added');

  const d1 = tAddChild(p1);
  assert(!!d1, 'dept child added');

  const r1 = tAddChild(d1);
  assert(!!r1, 'role child added');

  const before = findWithParent(tRoot, r1).node.children.length;
  const nope = tAddChild(r1);
  assert(nope === null, 'no children under role');
  assert(findWithParent(tRoot, r1).node.children.length === before, 'role still leaf');

  const tRoot2 = makeNode(LEVEL.COMPANY, 'Проект');
  const pA = makeNode(LEVEL.PROJECT, 'P1');
  const pB = makeNode(LEVEL.PROJECT, 'P2');
  const dB = makeNode(LEVEL.DEPT, 'D2');
  pB.children.push(dB);
  tRoot2.children.push(pA, pB);

  function tFlattenWL2() {
    const out = [];
    (function walk(n) {
      out.push({ id: n.id, level: n.level });
      for (const ch of n.children) walk(ch);
    })(tRoot2);
    return out;
  }

  function tFirstDeeperAfter2(id) {
    const flat = tFlattenWL2();
    const idx = flat.findIndex(x => x.id === id);
    if (idx < 0) return null;
    const base = flat[idx].level;
    for (let i = idx + 1; i < flat.length; i++) {
      if (flat[i].level > base) return flat[i].id;
    }
    return null;
  }

  assert(tFirstDeeperAfter2(pA.id) === dB.id, 'arrow right deeper navigation skips to next subtree');
  assert(tFirstDeeperAfter(pA.id) === null, 'firstDeeperAfter is tree-specific');

  console.log('All tests passed');
}

function updateOrdinalButton() {
  const btn = document.getElementById("toggleOrdinals");
  if (!btn) return;

  if (showOrdinals) {
    btn.classList.add("is-active");
  } else {
    btn.classList.remove("is-active");
  }
}

function syncOrdinalsModeClass() {
  document.body.classList.toggle("ordinals-on", !!showOrdinals);
}

function initOrdinalToggle() {
  const btn = document.getElementById("toggleOrdinals");
  if (!btn) return;

  btn.addEventListener("click", () => {
    showOrdinals = !showOrdinals;
    updateOrdinalButton();
    syncOrdinalsModeClass();
    render();
  });

  updateOrdinalButton();
  syncOrdinalsModeClass();
}

function updateCaptionButton() {
  const btn = document.getElementById("toggleCaptions");
  if (!btn) return;

  if (showCaptions) {
    btn.classList.add("is-active");
  } else {
    btn.classList.remove("is-active");
  }
}

function initCaptionToggle() {
  const btn = document.getElementById("toggleCaptions");
  if (!btn) return;

  btn.addEventListener("click", () => {
    showCaptions = !showCaptions;
    updateCaptionButton();
    render();
  });

  updateCaptionButton();
}

initProjectsSidebar();
render();
initOrdinalToggle();
initCaptionToggle();

if (new URLSearchParams(location.search).get('test') === '1') {
  runTests();
}

function updateDirectionButtons() {
  const horizontalBtn = document.getElementById("hierarchyHorizontalBtn");
  const verticalBtn = document.getElementById("hierarchyVerticalBtn");

  if (!horizontalBtn || !verticalBtn) return;

  const enabled =
    currentView === VIEW.HIERARCHY ||
    currentView === VIEW.AICYCLE;

  horizontalBtn.disabled = !enabled;
  verticalBtn.disabled = !enabled;
}
