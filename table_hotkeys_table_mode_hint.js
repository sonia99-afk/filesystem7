(function () {
  if (typeof window === "undefined") return;

  const SELECTION_ACTIONS = [
    "navUp",
    "navDown",
    "navClick",
    "levelNavUp",
    "levelNavDown",
    "branchNavLeft",
    "branchNavRight",
  ];

  const MULTISELECT_ACTIONS = [
  "rangeUp",
  "rangeDown",
  "rangeClick",
  "branchRangeLeft",
  "branchRangeRight",
  "deepUp",
  "deepDown",
  "deepClick",
  "selectAll",
];
  const TREE_MOVE_ACTIONS = [
    "moveUp",
    "moveDown",
  ];

  function unmarkMoveSectionSharedCells() {
  const moveUpCell = getActionCell("moveUp");
  const row = moveUpCell?.closest("tr");
  if (!row) return;

  Array.from(row.children).forEach((td) => {
    const text = (td.textContent || "").trim();

    if (
      text === "Перемещение" ||
      text === "Зажать ЛКМ > Переместить" ||
      text === "нет, не нужно"
    ) {
      td.classList.add("hk-table-mode-keep-normal");
      td.removeAttribute(MARK_ATTR);
      td.removeAttribute("title");
    }
  });
}

  const ALL_ACTIONS = [
    ...SELECTION_ACTIONS,
    ...MULTISELECT_ACTIONS,
    ...TREE_MOVE_ACTIONS,
  ];

  const STYLE_ID = "table-hotkeys-table-mode-hint-style";
  const MARK_ATTR = "data-table-mode-disabled";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      body.view-table tr.hk-table-mode-disabled > td {
        background: rgba(128, 128, 128, 0.16) !important;
        color: rgba(0, 0, 0, 0.5) !important;
      }

      body.view-table tr.hk-table-mode-disabled > td.hk-table-mode-keep-normal {
  background: inherit !important;
  color: inherit !important;
}

      body.view-table tr.hk-table-mode-disabled > td * {
        color: inherit !important;
      }

      body.view-table tr.hk-table-mode-disabled td[data-action] {
        color: rgba(0, 0, 0, 0.5) !important;
      }

      body.view-table tr.hk-table-mode-disabled td[${MARK_ATTR}="true"]::after {
        content: "";
      }

     
      body.view-table tr.hk-table-mode-disabled {
        pointer-events: none;
      }
    
    `;

    document.head.appendChild(style);
  }

  function getActionCell(action) {
    return document.querySelector(`td[data-action="${action}"]`);
  }

  function markRow(tr) {
    if (!tr) return;

    tr.classList.add("hk-table-mode-disabled");

    Array.from(tr.children).forEach((td) => {
      td.setAttribute(MARK_ATTR, "true");
      td.title = "Недоступно в табличном режиме";
    });
  }

  function markAction(action) {
    const td = getActionCell(action);
    if (!td) return;

    td.setAttribute(MARK_ATTR, "true");
    td.title = "Недоступно в табличном режиме";

    const tr = td.closest("tr");
    markRow(tr);
  }

function applyMarks() {
  ALL_ACTIONS.forEach(markAction);
  unmarkMoveSectionSharedCells();
}

  function init() {
    ensureStyle();
    applyMarks();

    const observer = new MutationObserver(() => {
      applyMarks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();