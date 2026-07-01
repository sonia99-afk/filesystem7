(function () {
    if (typeof window === "undefined") return;

    const TABLE_PROPERTY_COLUMNS = [
      {
        key: "text",
        title: "Текст",
        inputType: "text",
        placeholder: "",
      },
      {
        key: "startDate",
        title: "Дата начала",
        inputType: "date",
      },
      {
        key: "startTime",
        title: "Время начала",
        inputType: "time",
      },
      {
        key: "endDate",
        title: "Дата завершения",
        inputType: "date",
      },
      {
        key: "endTime",
        title: "Время завершения",
        inputType: "time",
      },
    ];

    const TABLE_DATE_RANGE_COLUMN = {
      key: "dateRange",
      title: "Дата период",
      inputType: "dateRange",
      startKey: "startDate",
      endKey: "endDate",
    };
    
    const TABLE_TIME_RANGE_COLUMN = {
      key: "timeRange",
      title: "Время период",
      inputType: "timeRange",
      startKey: "startTime",
      endKey: "endTime",
    };

    const TABLE_TAG_ADD_VALUE = "__add_tag__";

let tableExtraTagOptions = [];

const tableTimeSessionsOpenIds = new Set();
let tableTimeTicker = null;

const tableTimerSessionsOpenIds = new Set();

const TIMER_STEP_MS = 5 * 60 * 1000;

const TABLE_SELECT_PROPERTY_COLUMNS = [
  {
    key: "priority",
    title: "Приоритет",
    inputType: "select",
    options: [
      { value: "", label: "нет" },
      { value: "высокий", label: "высокий" },
      { value: "средний", label: "средний" },
      { value: "низкий", label: "низкий" },
    ],
  },
  {
    key: "focus",
    title: "Фокус",
    inputType: "select",
    options: [
      { value: "", label: "нет" },
      { value: "план", label: "план" },
      { value: "подготовка", label: "подготовка" },
      { value: "фокус", label: "фокус" },
      { value: "скрыт", label: "скрыт" },
    ],
  },
  {
    key: "status",
    title: "Статус",
    inputType: "select",
    options: [
      { value: "", label: "нет" },
      { value: "очередь", label: "очередь" },
      { value: "в работе", label: "в работе" },
      { value: "на проверке", label: "на проверке" },
      { value: "на доработке", label: "на доработке" },
      { value: "завершено", label: "завершено" },
    ],
  },
  {
    key: "tag",
    title: "Тег",
    inputType: "select",
    options: getTableTagOptions,
  },
];

const TABLE_ICON_COLUMN = {
  key: "icon",
  title: "Иконка",
  inputType: "select",
  options: [
    { value: "", label: "сбросить" },
    { value: "circle", label: "● круг" },
    { value: "diamond", label: "◆ ромб" },
    { value: "star", label: "★ звезда" },
    { value: "flag", label: "⚑ флаг" },
    { value: "spark", label: "✦ искра" },
  ],
};

const TABLE_EXTRA_IMAGE_COLUMN = {
  key: "extraImage",
  title: "Доп изображение",
  inputType: "image",
};

const TABLE_FILE_COLUMN = {
  key: "file",
  title: "Файл",
  inputType: "file",
};

const TABLE_TIME_COUNTER_COLUMN = {
  key: "timeCounter",
  title: "Счётчик времени",
  inputType: "timeCounter",
};

const TABLE_TIMER_DURATION_COLUMN = {
  key: "timer",
  title: "Время таймера",
  inputType: "timerDuration",
};

const TABLE_TIMER_REMAINING_COLUMN = {
  key: "timer",
  title: "Оставшееся время",
  inputType: "timerRemaining",
};

function getAllTablePropertyColumns() {
  return [
    ...TABLE_PROPERTY_COLUMNS,
    TABLE_DATE_RANGE_COLUMN,
    TABLE_TIME_RANGE_COLUMN,
    ...TABLE_SELECT_PROPERTY_COLUMNS,
    TABLE_EXTRA_IMAGE_COLUMN,
    TABLE_FILE_COLUMN,
    TABLE_TIME_COUNTER_COLUMN,
    TABLE_TIMER_DURATION_COLUMN,
    TABLE_TIMER_REMAINING_COLUMN,
  ];
}


  
    window.renderTableView = function renderTableView() {
      syncProjectsSidebar();
  
      const host = document.getElementById("tree");
      if (!host) return;
  
      host.innerHTML = "";
  
      const wrap = document.createElement("div");
      wrap.className = "table-view";
  
      const table = document.createElement("table");
      table.className = "structure-table";
  
      table.innerHTML = `
  <thead>
    <tr>
      <th>ID</th>
      <th>Отметка</th>
      <th>Нумерация</th>
      <th>Иконка</th>
      <th>Обложка</th>
      <th>Уровень</th>
      <th>Название</th>
      <th>Описание</th>
      ${getAllTablePropertyColumns().map((col) => `<th>${col.title}</th>`).join("")}
    </tr>
  </thead>
`;
  
      const tbody = document.createElement("tbody");
      const displayRoot =
        window.objectFocus?.getFocusedRootNode?.() || root;

      const displayRootOrdinalPath =
        window.objectFocus?.getFocusedRootOrdinalPath?.() || [];

      const rows = flattenTableRows(displayRoot, displayRootOrdinalPath);
  
      rows.forEach((item) => {
        tbody.appendChild(renderTableRow(item.node, item.ordinalPath));
      });
  
      table.appendChild(tbody);
      wrap.appendChild(table);
      host.appendChild(wrap);

      layoutTableCollapseColumn(host, wrap);
  
      if (treeHasFocus) {
        const selectedRow = host.querySelector(`.row[data-id="${cssEscape(selectedId)}"]`);
        selectedRow?.focus({ preventScroll: true });
      }
    };


    function layoutTableCollapseColumn(host, wrap) {
      host.querySelectorAll(".table-collapse-col").forEach((el) => el.remove());
    
      const hostBox = host.getBoundingClientRect();
    
      wrap.querySelectorAll(".row[data-id]").forEach((row) => {
        const id = row.dataset.id;
        const found = findWithParent(root, id);
    
        if (!found?.node?.children?.length) return;
    
        const btn = document.createElement("button");
        btn.type = "button";
        const isCollapsed = window.collapseNodes?.isCollapsed?.(id);

btn.className = "table-collapse-col" + (isCollapsed ? " is-collapsed" : "");
btn.dataset.id = id;

btn.textContent = isCollapsed ? "[+]" : "[-]";

          row.addEventListener("mouseenter", () => {
            btn.classList.add("is-visible");
          });
          
          row.addEventListener("mouseleave", () => {
            if (!btn.matches(":hover")) {
              btn.classList.remove("is-visible");
            }
          });
          
          btn.addEventListener("mouseleave", () => {
            btn.classList.remove("is-visible");
          });
    
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectedId = id;
          treeHasFocus = true;
          window.collapseNodes?.toggle?.(id);
        });

        function makeEmptyTimerState() {
  return {
    durationMs: 0,
    elapsedMs: 0,
    running: false,
    startedAt: null,
    sessions: [],
  };
}

function getTimerState(node, key = "timer") {
  const raw = getTableProp(node, key);

  if (!raw || typeof raw !== "object") {
    return makeEmptyTimerState();
  }

  return {
    durationMs: Number(raw.durationMs) || 0,
    elapsedMs: Number(raw.elapsedMs) || 0,
    running: !!raw.running,
    startedAt: Number(raw.startedAt) || null,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
  };
}

function getTimerElapsedMs(state, now = Date.now()) {
  let elapsed = Number(state.elapsedMs) || 0;

  if (state.running && state.startedAt) {
    elapsed += Math.max(0, now - Number(state.startedAt));
  }

  return Math.min(elapsed, Number(state.durationMs) || 0);
}

function getTimerRemainingMs(state, now = Date.now()) {
  return Math.max(0, (Number(state.durationMs) || 0) - getTimerElapsedMs(state, now));
}

function setTimerState(node, key, state) {
  setTableProp(node, key, {
    durationMs: Math.max(0, Number(state.durationMs) || 0),
    elapsedMs: Math.max(0, Number(state.elapsedMs) || 0),
    running: !!state.running,
    startedAt: state.startedAt ? Number(state.startedAt) : null,
    sessions: Array.isArray(state.sessions) ? state.sessions : [],
  });
}

function changeTimerDuration(node, key, deltaMs) {
  const state = getTimerState(node, key);

  const nextDuration = Math.max(0, state.durationMs + deltaMs);
  const currentElapsed = getTimerElapsedMs(state);

  setTimerState(node, key, {
    ...state,
    durationMs: nextDuration,
    elapsedMs: Math.min(currentElapsed, nextDuration),
    startedAt: state.running ? Date.now() : null,
  });

  if (typeof render === "function") render();
}

function startTimerRemaining(node, key) {
  const state = getTimerState(node, key);

  if (state.running) return;
  if (getTimerRemainingMs(state) <= 0) return;

  setTimerState(node, key, {
    ...state,
    running: true,
    startedAt: Date.now(),
  });

  if (typeof render === "function") render();
}

function pauseTimerRemaining(node, key) {
  const state = getTimerState(node, key);

  if (!state.running || !state.startedAt) return;

  const endAt = Date.now();
  const startAt = Number(state.startedAt);
  const beforeElapsed = Number(state.elapsedMs) || 0;
  const availableMs = Math.max(0, (Number(state.durationMs) || 0) - beforeElapsed);
  const rawDurationMs = Math.max(0, endAt - startAt);
  const durationMs = Math.min(rawDurationMs, availableMs);
  const nextElapsed = Math.min((Number(state.durationMs) || 0), beforeElapsed + durationMs);

  const sessions = [...state.sessions];

  if (durationMs > 0) {
    sessions.push({
      startAt,
      endAt: startAt + durationMs,
      durationMs,
    });
  }

  setTimerState(node, key, {
    ...state,
    elapsedMs: nextElapsed,
    running: false,
    startedAt: null,
    sessions,
  });

  if (typeof render === "function") render();
}

function resetTimerRemaining(node, key) {
  const state = getTimerState(node, key);

  setTimerState(node, key, {
    ...state,
    elapsedMs: 0,
    running: false,
    startedAt: null,
    sessions: [],
  });

  tableTimerSessionsOpenIds.delete(node.id);

  if (typeof render === "function") render();
}

function finishTimerAtZero(node, key) {
  const state = getTimerState(node, key);
  if (!state.running || !state.startedAt) return;

  const endAt = Date.now();
  const startAt = Number(state.startedAt);
  const beforeElapsed = Number(state.elapsedMs) || 0;
  const availableMs = Math.max(0, (Number(state.durationMs) || 0) - beforeElapsed);
  const rawDurationMs = Math.max(0, endAt - startAt);
  const durationMs = Math.min(rawDurationMs, availableMs);

  const sessions = [...state.sessions];

  if (durationMs > 0) {
    sessions.push({
      startAt,
      endAt: startAt + durationMs,
      durationMs,
    });
  }

  setTimerState(node, key, {
    ...state,
    elapsedMs: Number(state.durationMs) || 0,
    running: false,
    startedAt: null,
    sessions,
  });

  if (typeof render === "function") render();
}
    
        const rowBox = row.getBoundingClientRect();
        btn.style.top = `${Math.round(rowBox.top - hostBox.top)}px`;
    
        host.appendChild(btn);
      });
    }

    
  
    function flattenTableRows(node, ordinalPath = [], out = []) {
      out.push({ node, ordinalPath });
    
      const collapsed =
        window.collapseNodes?.isCollapsed?.(node.id);
    
      if (collapsed) {
        return out;
      }
    
      (node.children || []).forEach((child, index) => {
        flattenTableRows(child, ordinalPath.concat(index + 1), out);
      });
    
      return out;
    }

    function ensureTableProps(node) {
      if (!node.tableProps || typeof node.tableProps !== "object") {
        node.tableProps = {};
      }
    
      return node.tableProps;
    }
    
    function getTableProp(node, key) {
      const props = ensureTableProps(node);
      return props[key] || "";
    }
    
    function setTableProp(node, key, value) {
      const props = ensureTableProps(node);
      const oldValue = props[key] || "";
    
      if (oldValue === value) return;
    
      if (typeof pushHistory === "function" && typeof snapshot === "function") {
        pushHistory(snapshot());
      }
    
      props[key] = value;
      if (
        key === "startDate" ||
        key === "endDate" ||
        key === "startTime" ||
        key === "endTime"
      ) {
        requestAnimationFrame(() => {
          syncTableRangeControlsForKey(node, key);
        });
      }
    }

    function syncTableRangeControlsForKey(node, key) {
      const host = document.getElementById("tree");
      if (!host || !node?.id) return;
    
      host.querySelectorAll(".table-range-control[data-id]").forEach((wrap) => {
        if (wrap.dataset.id !== node.id) return;
    
        const startKey = wrap.dataset.startKey;
        const endKey = wrap.dataset.endKey;
        const inputType = wrap.dataset.inputType || "text";
    
        if (key && key !== startKey && key !== endKey) return;
    
        const startInput = wrap.querySelector('.table-range-input[data-role="start"]');
        const endInput = wrap.querySelector('.table-range-input[data-role="end"]');
        const view = wrap.querySelector(".table-range-view");
    
        if (startInput && document.activeElement !== startInput) {
          startInput.value = getTableProp(node, startKey);
        }
    
        if (endInput && document.activeElement !== endInput) {
          endInput.value = getTableProp(node, endKey);
        }
    
        if (view) {
          view.textContent = getTableRangeViewText(
            node,
            {
              startKey,
              endKey,
            },
            inputType
          );
        }
      });
    }
    
    function syncTableSingleInputsForKey(node, key) {
      const host = document.getElementById("tree");
      if (!host || !node?.id || !key) return;
    
      // Старый вариант — для обычных input-колонок
      host.querySelectorAll(".table-prop-cell[data-id]").forEach((cell) => {
        if (cell.dataset.id !== node.id) return;
        if (cell.dataset.prop !== key) return;
    
        const input = cell.querySelector(".table-prop-input");
        if (!input || document.activeElement === input) return;
    
        input.value = getTableProp(node, key);
      });
    
      // Новый вариант — для компактных date/time ячеек
      host.querySelectorAll(".table-compact-datetime-control[data-id]").forEach((wrap) => {
        if (wrap.dataset.id !== node.id) return;
        if (wrap.dataset.key !== key) return;
    
        const view = wrap.querySelector(".table-compact-datetime-view");
        const input = wrap.querySelector(".table-compact-datetime-input");
    
        if (input && document.activeElement !== input) {
          input.value = getTableProp(node, key);
        }
    
        if (view) {
          const fakeColumn = {
            key,
            inputType:
              key === "startDate" || key === "endDate"
                ? "date"
                : "time",
          };
    
          view.textContent = getCompactDateTimeViewValue(node, fakeColumn);
        }
      });
    }

    function setTableRangeProps(node, startKey, endKey, startValue, endValue) {
      const props = ensureTableProps(node);
    
      const oldStart = props[startKey] || "";
      const oldEnd = props[endKey] || "";
    
      if (oldStart === startValue && oldEnd === endValue) return;
    
      if (typeof pushHistory === "function" && typeof snapshot === "function") {
        pushHistory(snapshot());
      }
    
      props[startKey] = startValue;
      props[endKey] = endValue;
      requestAnimationFrame(() => {
  syncTableSingleInputsForKey(node, startKey);
  syncTableSingleInputsForKey(node, endKey);
  syncTableRangeControlsForKey(node, startKey);
  syncTableRangeControlsForKey(node, endKey);
});
    }

    function getFileIcon(fileData) {
      const name = String(fileData?.name || "").toLowerCase();
      const type = String(fileData?.type || "").toLowerCase();
    
      if (type.startsWith("image/")) return "🖼️";
      if (type.startsWith("video/")) return "🎬";
      if (type.startsWith("audio/")) return "🎵";
    
      if (name.endsWith(".pdf")) return "📕";
      if (name.endsWith(".doc") || name.endsWith(".docx")) return "📘";
      if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "📗";
      if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "📙";
      if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z")) return "🗜️";
    
      return "📄";
    }
    
    function makeTableFileControl(node, key) {
      const value = getTableProp(node, key);
    
      const wrap = document.createElement("div");
      wrap.className = "table-file-control";
    
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.hidden = true;
    
      const uploadBtn = document.createElement("button");
      uploadBtn.type = "button";
      uploadBtn.className = "table-file-btn";
      uploadBtn.textContent = "загрузить файл";
    
      function selectNode(e) {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      }
    
      wrap.addEventListener("click", selectNode);
      wrap.addEventListener("dblclick", (e) => e.stopPropagation());
    
      uploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        fileInput.click();
      });
    
      fileInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
    
        const reader = new FileReader();
    
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
    
          if (!dataUrl) return;
    
          setTableProp(node, key, {
            name: file.name,
            type: file.type || "",
            size: file.size || 0,
            dataUrl,
          });
    
          fileInput.value = "";
    
          if (typeof render === "function") {
            render();
          }
        };
    
        reader.readAsDataURL(file);
      });
    
      if (value && typeof value === "object") {
        const fileBox = document.createElement("div");
        fileBox.className = "table-file-box";
    
        const icon = document.createElement("span");
        icon.className = "table-file-icon";
        icon.textContent = getFileIcon(value);
    
        const name = document.createElement("span");
        name.className = "table-file-name";
        name.textContent = value.name || "файл";
        name.title = value.name || "файл";
    
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "table-file-remove";
        removeBtn.textContent = "×";
        removeBtn.title = "Удалить файл";
    
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
    
          selectedId = node.id;
          treeHasFocus = true;
    
          setTableProp(node, key, "");
    
          if (typeof render === "function") {
            render();
          }
        });
    
        fileBox.appendChild(icon);
        fileBox.appendChild(name);
        fileBox.appendChild(removeBtn);
    
        wrap.appendChild(fileBox);
      }
    
      wrap.appendChild(uploadBtn);
      wrap.appendChild(fileInput);
    
      return wrap;
    }

    function makeEmptyTimeCounterState() {
      return {
        totalMs: 0,
        running: false,
        startedAt: null,
        sessions: [],
      };
    }
    
    function getTimeCounterState(node, key = "timeCounter") {
      const raw = getTableProp(node, key);
    
      if (!raw || typeof raw !== "object") {
        return makeEmptyTimeCounterState();
      }
    
      return {
        totalMs: Number(raw.totalMs) || 0,
        running: !!raw.running,
        startedAt: Number(raw.startedAt) || null,
        sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
      };
    }
    
    function getTimeCounterElapsedMs(state, now = Date.now()) {
      let total = Number(state.totalMs) || 0;
    
      if (state.running && state.startedAt) {
        total += Math.max(0, now - Number(state.startedAt));
      }
    
      return total;
    }
    
    function formatDurationMs(ms) {
      const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
    
      return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].join(":");
    }
    
    function formatShortTime(ts) {
      const d = new Date(ts);
    
      return [
        String(d.getHours()).padStart(2, "0"),
        String(d.getMinutes()).padStart(2, "0"),
      ].join(":");
    }
    
    function isSameCalendarDate(aTs, bTs) {
      const a = new Date(aTs);
      const b = new Date(bTs);
    
      return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      );
    }
    
    function formatSessionDateTime(ts) {
      const d = new Date(ts);
    
      const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
      const months = [
        "янв", "фев", "мар", "апр", "мая", "июн",
        "июл", "авг", "сен", "окт", "ноя", "дек"
      ];
    
      const weekday = weekdays[d.getDay()];
      const day = String(d.getDate()).padStart(2, "0");
      const month = months[d.getMonth()];
      const time = formatShortTime(ts);
    
      return `${weekday}, ${day} ${month}: ${time}`;
    }
    
    function formatSessionRange(session) {
      const startAt = Number(session.startAt) || 0;
      const endAt = Number(session.endAt) || 0;
    
      if (!startAt || !endAt) return "";
    
      if (isSameCalendarDate(startAt, endAt)) {
        return `${formatSessionDateTime(startAt)} - ${formatShortTime(endAt)}`;
      }
    
      return `${formatSessionDateTime(startAt)} - ${formatSessionDateTime(endAt)}`;
    }
    
    function startTimeCounter(node, key) {
      const state = getTimeCounterState(node, key);
    
      if (state.running) return;
    
      setTableProp(node, key, {
        ...state,
        running: true,
        startedAt: Date.now(),
      });
    
      if (typeof render === "function") render();
    }
    
    function pauseTimeCounter(node, key) {
      const state = getTimeCounterState(node, key);
    
      if (!state.running || !state.startedAt) return;
    
      const endAt = Date.now();
      const startAt = Number(state.startedAt);
      const durationMs = Math.max(0, endAt - startAt);
    
      const session = {
        startAt,
        endAt,
        durationMs,
      };
    
      setTableProp(node, key, {
        totalMs: (Number(state.totalMs) || 0) + durationMs,
        running: false,
        startedAt: null,
        sessions: [...state.sessions, session],
      });
    
      if (typeof render === "function") render();
    }
    
    function resetTimeCounter(node, key) {
      setTableProp(node, key, makeEmptyTimeCounterState());
    
      tableTimeSessionsOpenIds.delete(node.id);
    
      if (typeof render === "function") render();
    }

    function makeTableTimeCounterControl(node, key) {
      const state = getTimeCounterState(node, key);
      const elapsedMs = getTimeCounterElapsedMs(state);
    
      const wrap = document.createElement("div");
      wrap.className = "table-time-counter";
      wrap.dataset.id = node.id;
      wrap.dataset.key = key;
    
      function selectNode(e) {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      }
    
      wrap.addEventListener("click", selectNode);
      wrap.addEventListener("dblclick", (e) => e.stopPropagation());
    
      const top = document.createElement("div");
      top.className = "table-time-main";
    
      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "table-time-btn table-time-play";
      playBtn.textContent = state.running ? "⏸" : "▶";
      playBtn.title = state.running ? "Пауза и записать сессию" : "Старт";
    
      playBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        const current = getTimeCounterState(node, key);
    
        if (current.running) {
          pauseTimeCounter(node, key);
        } else {
          startTimeCounter(node, key);
        }
      });
    
      const timeBtn = document.createElement("button");
      timeBtn.type = "button";
      timeBtn.className = "table-time-value";
      timeBtn.textContent = formatDurationMs(elapsedMs);
      timeBtn.title = "Показать / скрыть сессии";
    
      timeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        if (tableTimeSessionsOpenIds.has(node.id)) {
          tableTimeSessionsOpenIds.delete(node.id);
        } else {
          tableTimeSessionsOpenIds.add(node.id);
        }
    
        if (typeof render === "function") render();
      });
    
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "table-time-btn table-time-reset";
      resetBtn.textContent = "↺";
    
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        resetTimeCounter(node, key);
      });
    
      top.appendChild(playBtn);
      top.appendChild(timeBtn);
      top.appendChild(resetBtn);
    
      wrap.appendChild(top);
    
      if (tableTimeSessionsOpenIds.has(node.id)) {
        const sessions = document.createElement("div");
        sessions.className = "table-time-sessions";
      
        const title = document.createElement("div");
        title.className = "table-time-sessions-title";
        title.textContent = "Сессии";
      
        sessions.appendChild(title);
    
        if (!state.sessions.length) {
          const empty = document.createElement("div");
          empty.className = "table-time-session-empty";
          empty.textContent = "сессий пока нет";
          sessions.appendChild(empty);
        } else {
          state.sessions
            .slice()
            .reverse()
            .forEach((session) => {
              const item = document.createElement("div");
              item.className = "table-time-session";
    
              const duration = document.createElement("div");
              duration.className = "table-time-session-duration";
              duration.textContent = formatDurationMs(session.durationMs);
    
              const range = document.createElement("div");
              range.className = "table-time-session-range";
              range.textContent = formatSessionRange(session);
    
              item.appendChild(duration);
              item.appendChild(range);
    
              sessions.appendChild(item);
            });
        }
    
        wrap.appendChild(sessions);
      }
    
      ensureTableTimeTicker();
    
      return wrap;
    }

    function updateVisibleTimeCounters() {
      const host = document.getElementById("tree");
      if (!host) return;
    
      host.querySelectorAll(".table-time-counter[data-id]").forEach((wrap) => {
        const id = wrap.dataset.id;
        const key = wrap.dataset.key || "timeCounter";
    
        if (!id) return;
    
        const found =
          typeof findWithParent === "function"
            ? findWithParent(root, id)
            : null;
    
        const node = found?.node;
        if (!node) return;
    
        const state = getTimeCounterState(node, key);
        const value = wrap.querySelector(".table-time-value");
    
        if (value) {
          value.textContent = formatDurationMs(
            getTimeCounterElapsedMs(state)
          );
        }
    
        const play = wrap.querySelector(".table-time-play");
        if (play) {
          play.textContent = state.running ? "⏸" : "▶";
          play.title = state.running ? "Пауза и записать сессию" : "Старт";
        }
      });

      host.querySelectorAll(".table-timer-countdown[data-id]").forEach((wrap) => {
        const id = wrap.dataset.id;
        const key = wrap.dataset.key || "timer";
      
        if (!id) return;
      
        const found =
          typeof findWithParent === "function"
            ? findWithParent(root, id)
            : null;
      
        const node = found?.node;
        if (!node) return;
      
        const state = getTimerState(node, key);
        const remainingMs = getTimerRemainingMs(state);
      
        if (state.running && remainingMs <= 0) {
          finishTimerAtZero(node, key);
          return;
        }
      
        const value = wrap.querySelector(".table-timer-countdown-value");
        if (value) {
          value.textContent = formatDurationMs(remainingMs);
        }
      
        const play = wrap.querySelector(".table-timer-countdown-play");
        if (play) {
          play.textContent = state.running ? "⏸" : "▶";
          play.title = state.running ? "Пауза и записать сессию" : "Старт";
          play.disabled = !state.running && remainingMs <= 0;
        }
      });
    }
    
    function ensureTableTimeTicker() {
      if (tableTimeTicker) return;
    
      tableTimeTicker = setInterval(() => {
        try {
          updateVisibleTimeCounters();
        } catch (_) {}
      }, 1000);
    }

    function makeTableImageControl(node, key) {
      const value = getTableProp(node, key);
    
      const wrap = document.createElement("div");
      wrap.className = "table-image-control";
    
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.hidden = true;
    
      const uploadBtn = document.createElement("button");
      uploadBtn.type = "button";
      uploadBtn.className = "table-image-btn";
      uploadBtn.textContent = "загрузить";
    
      function selectNode(e) {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      }
    
      wrap.addEventListener("click", selectNode);
      wrap.addEventListener("dblclick", (e) => e.stopPropagation());
    
      uploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        fileInput.click();
      });
    
      fileInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
    
        if (!file) return;
    
        if (!file.type || !file.type.startsWith("image/")) {
          alert("Можно загрузить только изображение.");
          fileInput.value = "";
          return;
        }
    
        const reader = new FileReader();
    
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
    
          if (!dataUrl) return;
    
          setTableProp(node, key, dataUrl);
    
          fileInput.value = "";
    
          if (typeof render === "function") {
            render();
          }
        };
    
        reader.readAsDataURL(file);
      });
    
      if (value) {
        const previewBox = document.createElement("div");
        previewBox.className = "table-image-preview-box";
    
        const img = document.createElement("img");
        img.className = "table-image-preview";
        img.src = value;
        img.alt = "Доп изображение";
    
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "table-image-remove";
        removeBtn.textContent = "×";
        removeBtn.title = "Удалить изображение";
    
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
    
          selectedId = node.id;
          treeHasFocus = true;
    
          setTableProp(node, key, "");
    
          if (typeof render === "function") {
            render();
          }
        });
    
        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);
    
        wrap.appendChild(previewBox);
      }
    
      wrap.appendChild(uploadBtn);
      wrap.appendChild(fileInput);
    
      return wrap;
    }
    
    function makeTablePropCell(node, column) {
      const td = document.createElement("td");
      td.className = "table-prop-cell";
      td.dataset.prop = column.key;
      td.dataset.id = node.id;

      if (isCompactDateTimeColumn(column)) {
        td.classList.add("table-compact-datetime-cell");
        td.appendChild(makeTableCompactDateTimeControl(node, column));
        return td;
      }

      if (column.inputType === "dateRange") {
        td.classList.add("table-date-range-cell");
        td.appendChild(makeTableRangeControl(node, column, "date"));
        return td;
      }
      
      if (column.inputType === "timeRange") {
        td.classList.add("table-time-range-cell");
        td.appendChild(makeTableRangeControl(node, column, "time"));
        return td;
      }

      if (column.key === "icon") {
        td.classList.add("table-icon-cell");
        td.appendChild(makeTableIconControl(node, column));
        return td;
      }

      if (column.key === "tag") {
        td.classList.add("table-tag-compact-cell");
        td.appendChild(makeTableTagCompactControl(node, column));
        return td;
      }

      if (
        column.key === "priority" ||
        column.key === "focus" ||
        column.key === "status"
      ) {
        td.classList.add("table-compact-select-cell");
        td.appendChild(makeTableCompactSelectControl(node, column));
        return td;
      }
    
      if (column.inputType === "select") {
        td.appendChild(makeTablePropSelect(node, column));
        return td;
      }
    
      if (column.inputType === "image") {
        td.classList.add("table-extra-image-cell");
        td.appendChild(makeTableImageControl(node, column.key));
        return td;
      }

      if (column.inputType === "file") {
        td.classList.add("table-file-cell");
        td.appendChild(makeTableFileControl(node, column.key));
        return td;
      }

      if (column.inputType === "timeCounter") {
        td.classList.add("table-time-cell");
        td.appendChild(makeTableTimeCounterControl(node, column.key));
        return td;
      }

      if (column.inputType === "timerDuration") {
        td.classList.add("table-timer-duration-cell");
        td.appendChild(makeTableTimerDurationControl(node, column.key));
        return td;
      }
      
      if (column.inputType === "timerRemaining") {
        td.classList.add("table-timer-remaining-cell");
        td.appendChild(makeTableTimerRemainingControl(node, column.key));
        return td;
      }
    
      const input = document.createElement("input");
      input.className = "table-prop-input";
      input.type = column.inputType || "text";
      input.value = getTableProp(node, column.key);

      if (column.placeholder) {
        input.placeholder = column.placeholder;
      }
    
      input.addEventListener("click", (e) => {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      input.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
    
      input.addEventListener("keydown", (e) => {
        // Чтобы стрелки, Backspace, Delete и текстовый ввод
        // работали внутри поля, а не как хоткеи дерева.
        e.stopPropagation();
      
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
      
          setTableProp(node, column.key, input.value);
      
          // Убираем фокус с поля, чтобы визуально было понятно,
          // что ввод завершён.
          input.blur();
        }
      });
    
      input.addEventListener("change", () => {
        setTableProp(node, column.key, input.value);
      });
    
      input.addEventListener("blur", () => {
        setTableProp(node, column.key, input.value);
      });
    
      td.appendChild(input);
    
      return td;
    }

    function makeTableRangeControl(node, column, inputType) {
      const wrap = document.createElement("div");
      wrap.className = "table-range-control";
      wrap.dataset.id = node.id;
      wrap.dataset.startKey = column.startKey;
      wrap.dataset.endKey = column.endKey;
      wrap.dataset.inputType = inputType;
    
      const view = document.createElement("button");
      view.type = "button";
      view.className = "table-range-view";
      view.textContent = getTableRangeViewText(node, column, inputType);
      view.title = column.title || "Изменить период";
    
      const editor = document.createElement("div");
      editor.className = "table-range-editor";
    
      const startInput = document.createElement("input");
      startInput.className = "table-range-input";
      startInput.type = inputType;
      startInput.value = getTableProp(node, column.startKey);
      startInput.dataset.role = "start";
    
      const separator = document.createElement("span");
      separator.className = "table-range-separator";
      separator.textContent = "→";
    
      const endInput = document.createElement("input");
      endInput.className = "table-range-input";
      endInput.type = inputType;
      endInput.value = getTableProp(node, column.endKey);
      endInput.dataset.role = "end";
    
      function selectNode(e) {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      }
    
      function syncView() {
        startInput.value = getTableProp(node, column.startKey);
        endInput.value = getTableProp(node, column.endKey);
        view.textContent = getTableRangeViewText(node, column, inputType);
      }
    
      function openEditor(e) {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        startInput.value = getTableProp(node, column.startKey);
        endInput.value = getTableProp(node, column.endKey);
    
        wrap.classList.add("is-editing");
    
        requestAnimationFrame(() => {
          startInput.focus({ preventScroll: true });
        });
      }
    
      function closeEditor() {
        syncView();
        wrap.classList.remove("is-editing");
      }
    
      function commit() {
        setTableRangeProps(
          node,
          column.startKey,
          column.endKey,
          startInput.value,
          endInput.value
        );
    
        closeEditor();
      }
    
      view.addEventListener("click", openEditor);
    
      wrap.addEventListener("click", (e) => {
        if (e.target === startInput || e.target === endInput) return;
        openEditor(e);
      });
    
      [startInput, endInput].forEach((input) => {
        input.addEventListener("click", selectNode);
    
        input.addEventListener("dblclick", (e) => {
          e.stopPropagation();
        });
    
        input.addEventListener("keydown", (e) => {
          e.stopPropagation();
    
          if (e.key === "Enter" || e.code === "NumpadEnter") {
            e.preventDefault();
            commit();
            input.blur();
            return;
          }
    
          if (e.key === "Escape") {
            e.preventDefault();
            closeEditor();
            input.blur();
            return;
          }
        });
    
        // Важно: change сохраняет значение, но НЕ закрывает редактор.
        // Так можно спокойно вводить дату/время цифрами.
        input.addEventListener("change", () => {
          setTableRangeProps(
            node,
            column.startKey,
            column.endKey,
            startInput.value,
            endInput.value
          );
    
          view.textContent = getTableRangeViewText(node, column, inputType);
        });
    
        input.addEventListener("blur", () => {
          setTimeout(() => {
            if (!wrap.contains(document.activeElement)) {
              commit();
            }
          }, 0);
        });
      });
    
      editor.appendChild(startInput);
      editor.appendChild(separator);
      editor.appendChild(endInput);
    
      wrap.appendChild(view);
      wrap.appendChild(editor);
    
      return wrap;
    }

    function getTableIconSymbol(value) {
      switch (value) {
        case "circle":
          return "●";
        case "diamond":
          return "◆";
        case "star":
          return "★";
        case "flag":
          return "⚑";
        case "spark":
          return "✦";
        default:
          return "";
      }
    }

    function formatTableDateCompact(value) {
      const raw = String(value || "");
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    
      if (!m) return raw;
    
      return `${m[3]}.${m[2]}.${m[1]}`;
    }

    function formatTableRangeValue(value, inputType) {
      if (inputType === "date") {
        return formatTableDateCompact(value);
      }
    
      if (inputType === "time") {
        return formatTableTimeCompact(value);
      }
    
      return String(value || "");
    }
    
    function getTableRangeViewText(node, column, inputType) {
      const startValue = getTableProp(node, column.startKey);
      const endValue = getTableProp(node, column.endKey);
    
      const startText = formatTableRangeValue(startValue, inputType);
      const endText = formatTableRangeValue(endValue, inputType);
    
      if (!startText && !endText) return "";
      if (startText && !endText) return `${startText} →`;
      if (!startText && endText) return `→ ${endText}`;
    
      return `${startText} → ${endText}`;
    }
    
    function formatTableTimeCompact(value) {
      return String(value || "");
    }
    
    function isCompactDateTimeColumn(column) {
      return (
        column.key === "startDate" ||
        column.key === "endDate" ||
        column.key === "startTime" ||
        column.key === "endTime"
      );
    }
    
    function getCompactDateTimeViewValue(node, column) {
      const value = getTableProp(node, column.key);
    
      if (column.inputType === "date") {
        return formatTableDateCompact(value);
      }
    
      if (column.inputType === "time") {
        return formatTableTimeCompact(value);
      }
    
      return String(value || "");
    }

    function getTableSelectLabel(node, column) {
      const value = getTableProp(node, column.key);
    
      if (!value) return "";
    
      const options =
        typeof column.options === "function"
          ? column.options(node)
          : (column.options || []);
    
      const found = options.find((option) => option.value === value);
    
      return found ? found.label : value;
    }

    function makeTableIconControl(node, column) {
      const wrap = document.createElement("div");
      wrap.className = "table-icon-control";
    
      const value = getTableProp(node, column.key);
    
      const view = document.createElement("button");
      view.type = "button";
      view.className = "table-icon-view";
      view.textContent = getTableIconSymbol(value);
      view.title = "Выбрать иконку";
    
      const select = makeTablePropSelect(node, column);
      select.classList.add("table-icon-select");
    
      function syncIconView() {
        const currentValue = getTableProp(node, column.key) || select.value || "";
        view.textContent = getTableIconSymbol(currentValue);
      }
    
      function openIconSelect(e) {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        wrap.classList.add("is-editing");
    
        requestAnimationFrame(() => {
          select.focus({ preventScroll: true });
        });
      }
    
      view.addEventListener("click", openIconSelect);
    
      wrap.addEventListener("click", (e) => {
        if (e.target === select) return;
        openIconSelect(e);
      });
    
      select.addEventListener("change", () => {
        // makeTablePropSelect уже сохранил значение,
        // а здесь мы сразу обновляем видимый символ.
        view.textContent = getTableIconSymbol(select.value);
        wrap.classList.remove("is-editing");
      });
    
      select.addEventListener("blur", () => {
        syncIconView();
        wrap.classList.remove("is-editing");
      });
    
      wrap.appendChild(view);
      wrap.appendChild(select);
    
      return wrap;
    }

    function makeTableCompactDateTimeControl(node, column) {
      const wrap = document.createElement("div");
      wrap.className = "table-compact-datetime-control";
      wrap.dataset.id = node.id;
      wrap.dataset.key = column.key;
    
      const view = document.createElement("button");
      view.type = "button";
      view.className = "table-compact-datetime-view";
      view.textContent = getCompactDateTimeViewValue(node, column);
      view.title = column.title || "Изменить";
    
      const input = document.createElement("input");
      input.className = "table-compact-datetime-input";
      input.type = column.inputType || "text";
      input.value = getTableProp(node, column.key);
    
      function syncView() {
        input.value = getTableProp(node, column.key);
        view.textContent = getCompactDateTimeViewValue(node, column);
      }
    
      function openEditor(e) {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        input.value = getTableProp(node, column.key);
        wrap.classList.add("is-editing");
    
        requestAnimationFrame(() => {
          input.focus({ preventScroll: true });
        });
      }
    
      function closeEditor() {
        syncView();
        wrap.classList.remove("is-editing");
      }
    
      function commit() {
        setTableProp(node, column.key, input.value);
        closeEditor();
      }
    
      view.addEventListener("click", openEditor);
    
      wrap.addEventListener("click", (e) => {
        if (e.target === input) return;
        openEditor(e);
      });
    
      input.addEventListener("click", (e) => {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      input.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
    
      input.addEventListener("keydown", (e) => {
        e.stopPropagation();
    
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
          commit();
          input.blur();
          return;
        }
    
        if (e.key === "Escape") {
          e.preventDefault();
          closeEditor();
          input.blur();
          return;
        }
      });
    
      // Важно:
      // change НЕ закрывает редактор, чтобы можно было спокойно вводить дату/время цифрами.
      input.addEventListener("change", () => {
        setTableProp(node, column.key, input.value);
      });
    
      input.addEventListener("blur", () => {
        commit();
      });
    
      wrap.appendChild(view);
      wrap.appendChild(input);
    
      return wrap;
    }

    function makeTableTagCompactControl(node, column) {
      const wrap = document.createElement("div");
      wrap.className = "table-tag-compact-control";
    
      const view = document.createElement("button");
      view.type = "button";
      view.className = "table-tag-compact-view";
      view.textContent = getTableProp(node, column.key) || "";
      view.title = "Выбрать тег";
    
      const editor = document.createElement("div");
      editor.className = "table-tag-compact-editor";
    
      const select = document.createElement("select");
      select.className = "table-tag-compact-select";
    
      function fillOptions() {
        select.innerHTML = "";
    
        const currentValue = getTableProp(node, column.key);
    
        const options =
          typeof column.options === "function"
            ? column.options(node)
            : (column.options || []);
    
        options.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          select.appendChild(opt);
        });
    
        if (
          currentValue &&
          !Array.from(select.options).some((opt) => opt.value === currentValue)
        ) {
          const opt = document.createElement("option");
          opt.value = currentValue;
          opt.textContent = currentValue;
    
          const addOption = select.querySelector(
            `option[value="${TABLE_TAG_ADD_VALUE}"]`
          );
    
          if (addOption) {
            select.insertBefore(opt, addOption);
          } else {
            select.appendChild(opt);
          }
        }
    
        select.value = currentValue || "";
      }
    
      fillOptions();
    
      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "table-tag-compact-action";
      renameBtn.textContent = "переименовать";
    
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "table-tag-compact-action";
      deleteBtn.textContent = "удалить";
    
      function syncView() {
        view.textContent = getTableProp(node, column.key) || "";
      }
    
      function syncButtons() {
        const hasTag = isRealTableTag(select.value);
    
        renameBtn.hidden = !hasTag;
        deleteBtn.hidden = !hasTag;
      }
    
      function openEditor(e) {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        fillOptions();
        syncButtons();
    
        wrap.classList.add("is-editing");
    
        requestAnimationFrame(() => {
          select.focus({ preventScroll: true });
        });
      }
    
      function closeEditor() {
        syncView();
        wrap.classList.remove("is-editing");
      }
    
      view.addEventListener("click", openEditor);
    
      select.addEventListener("click", (e) => {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      select.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
    
      select.addEventListener("keydown", (e) => {
        e.stopPropagation();
    
        if (e.key === "Escape") {
          e.preventDefault();
          closeEditor();
          return;
        }
    
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
          closeEditor();
          return;
        }
      });
    
      select.addEventListener("change", () => {
        if (select.value === TABLE_TAG_ADD_VALUE) {
          const oldValue = getTableProp(node, column.key) || "";
          const newTag = window.prompt("Новый тег", "");
    
          if (!newTag || !newTag.trim()) {
            select.value = oldValue;
            syncButtons();
            return;
          }
    
          const tagValue = addTableTagOption(newTag);
    
          setTableProp(node, column.key, tagValue);
    
          if (typeof render === "function") render();
          return;
        }
    
        setTableProp(node, column.key, select.value);
    
        syncView();
        syncButtons();
      });
    
      renameBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
    
      deleteBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
    
      renameBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        renameTableTagOption(select.value);
      });
    
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        deleteTableTagOption(select.value);
      });
    
      wrap.addEventListener("focusout", () => {
        setTimeout(() => {
          if (!wrap.contains(document.activeElement)) {
            closeEditor();
          }
        }, 0);
      });
    
      syncButtons();
    
      editor.appendChild(select);
      editor.appendChild(renameBtn);
      editor.appendChild(deleteBtn);
    
      wrap.appendChild(view);
      wrap.appendChild(editor);
    
      return wrap;
    }

    function makeTableCompactSelectControl(node, column) {
      const wrap = document.createElement("div");
      wrap.className = "table-compact-select-control";
    
      const view = document.createElement("button");
      view.type = "button";
      view.className = "table-compact-select-view";
      view.textContent = getTableSelectLabel(node, column);
      view.title = column.title || "Выбрать";
    
      const select = makeTablePropSelect(node, column);
      select.classList.add("table-compact-select");
    
      function syncView() {
        view.textContent = getTableSelectLabel(node, column);
      }
    
      function openSelect(e) {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        wrap.classList.add("is-editing");
    
        requestAnimationFrame(() => {
          select.focus({ preventScroll: true });
        });
      }
    
      view.addEventListener("click", openSelect);
    
      wrap.addEventListener("click", (e) => {
        if (e.target === select) return;
        openSelect(e);
      });
    
      select.addEventListener("change", () => {
        view.textContent =
          select.options[select.selectedIndex]?.textContent || "";
    
        wrap.classList.remove("is-editing");
      });
    
      select.addEventListener("blur", () => {
        syncView();
        wrap.classList.remove("is-editing");
      });
    
      wrap.appendChild(view);
      wrap.appendChild(select);
    
      return wrap;
    }

    function makeEmptyTimerState() {
      return {
        durationMs: 0,
        elapsedMs: 0,
        running: false,
        startedAt: null,
        sessions: [],
      };
    }
    
    function getTimerState(node, key = "timer") {
      const raw = getTableProp(node, key);
    
      if (!raw || typeof raw !== "object") {
        return makeEmptyTimerState();
      }
    
      return {
        durationMs: Number(raw.durationMs) || 0,
        elapsedMs: Number(raw.elapsedMs) || 0,
        running: !!raw.running,
        startedAt: Number(raw.startedAt) || null,
        sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
      };
    }
    
    function getTimerElapsedMs(state, now = Date.now()) {
      let elapsed = Number(state.elapsedMs) || 0;
    
      if (state.running && state.startedAt) {
        elapsed += Math.max(0, now - Number(state.startedAt));
      }
    
      return Math.min(elapsed, Number(state.durationMs) || 0);
    }
    
    function getTimerRemainingMs(state, now = Date.now()) {
      return Math.max(0, (Number(state.durationMs) || 0) - getTimerElapsedMs(state, now));
    }
    
    function setTimerState(node, key, state) {
      setTableProp(node, key, {
        durationMs: Math.max(0, Number(state.durationMs) || 0),
        elapsedMs: Math.max(0, Number(state.elapsedMs) || 0),
        running: !!state.running,
        startedAt: state.startedAt ? Number(state.startedAt) : null,
        sessions: Array.isArray(state.sessions) ? state.sessions : [],
      });
    }
    
    function changeTimerDuration(node, key, deltaMs) {
      const state = getTimerState(node, key);
    
      const nextDuration = Math.max(0, state.durationMs + deltaMs);
      const currentElapsed = getTimerElapsedMs(state);
    
      setTimerState(node, key, {
        ...state,
        durationMs: nextDuration,
        elapsedMs: Math.min(currentElapsed, nextDuration),
        startedAt: state.running ? Date.now() : null,
      });
    
      if (typeof render === "function") render();
    }
    
    function startTimerRemaining(node, key) {
      const state = getTimerState(node, key);
    
      if (state.running) return;
      if (getTimerRemainingMs(state) <= 0) return;
    
      setTimerState(node, key, {
        ...state,
        running: true,
        startedAt: Date.now(),
      });
    
      if (typeof render === "function") render();
    }
    
    function pauseTimerRemaining(node, key) {
      const state = getTimerState(node, key);
    
      if (!state.running || !state.startedAt) return;
    
      const endAt = Date.now();
      const startAt = Number(state.startedAt);
      const beforeElapsed = Number(state.elapsedMs) || 0;
      const availableMs = Math.max(0, (Number(state.durationMs) || 0) - beforeElapsed);
      const rawDurationMs = Math.max(0, endAt - startAt);
      const durationMs = Math.min(rawDurationMs, availableMs);
      const nextElapsed = Math.min((Number(state.durationMs) || 0), beforeElapsed + durationMs);
    
      const sessions = [...state.sessions];
    
      if (durationMs > 0) {
        sessions.push({
          startAt,
          endAt: startAt + durationMs,
          durationMs,
        });
      }
    
      setTimerState(node, key, {
        ...state,
        elapsedMs: nextElapsed,
        running: false,
        startedAt: null,
        sessions,
      });
    
      if (typeof render === "function") render();
    }
    
    function resetTimerRemaining(node, key) {
      const state = getTimerState(node, key);
    
      setTimerState(node, key, {
        ...state,
        elapsedMs: 0,
        running: false,
        startedAt: null,
        sessions: [],
      });
    
      tableTimerSessionsOpenIds.delete(node.id);
    
      if (typeof render === "function") render();
    }
    
    function finishTimerAtZero(node, key) {
      const state = getTimerState(node, key);
      if (!state.running || !state.startedAt) return;
    
      const endAt = Date.now();
      const startAt = Number(state.startedAt);
      const beforeElapsed = Number(state.elapsedMs) || 0;
      const availableMs = Math.max(0, (Number(state.durationMs) || 0) - beforeElapsed);
      const rawDurationMs = Math.max(0, endAt - startAt);
      const durationMs = Math.min(rawDurationMs, availableMs);
    
      const sessions = [...state.sessions];
    
      if (durationMs > 0) {
        sessions.push({
          startAt,
          endAt: startAt + durationMs,
          durationMs,
        });
      }
    
      setTimerState(node, key, {
        ...state,
        elapsedMs: Number(state.durationMs) || 0,
        running: false,
        startedAt: null,
        sessions,
      });
    
      if (typeof render === "function") render();
    }

    function makeTableTimerDurationControl(node, key) {
      const state = getTimerState(node, key);
    
      const wrap = document.createElement("div");
      wrap.className = "table-timer-duration";
    
      wrap.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "table-timer-btn";
      minusBtn.textContent = "−";
      minusBtn.title = "Уменьшить на 5 минут";
    
      minusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        changeTimerDuration(node, key, -TIMER_STEP_MS);
      });
    
      const value = document.createElement("span");
      value.className = "table-timer-duration-value";
      value.textContent = formatDurationMs(state.durationMs);
    
      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "table-timer-btn";
      plusBtn.textContent = "+";
      plusBtn.title = "Увеличить на 5 минут";
    
      plusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        changeTimerDuration(node, key, TIMER_STEP_MS);
      });
    
      wrap.appendChild(minusBtn);
      wrap.appendChild(value);
      wrap.appendChild(plusBtn);
    
      return wrap;
    }

    function makeTableTimerRemainingControl(node, key) {
      const state = getTimerState(node, key);
      const remainingMs = getTimerRemainingMs(state);
    
      const wrap = document.createElement("div");
      wrap.className = "table-timer-countdown";
      wrap.dataset.id = node.id;
      wrap.dataset.key = key;
    
      wrap.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      const top = document.createElement("div");
      top.className = "table-timer-countdown-main";
    
      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "table-timer-countdown-btn table-timer-countdown-play";
      playBtn.textContent = state.running ? "⏸" : "▶";
      playBtn.title = state.running ? "Пауза и записать сессию" : "Старт";
      playBtn.disabled = !state.running && remainingMs <= 0;
    
      playBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        const current = getTimerState(node, key);
    
        if (current.running) {
          pauseTimerRemaining(node, key);
        } else {
          startTimerRemaining(node, key);
        }
      });
    
      const timeBtn = document.createElement("button");
      timeBtn.type = "button";
      timeBtn.className = "table-timer-countdown-value";
      timeBtn.textContent = formatDurationMs(remainingMs);
      timeBtn.title = "Показать / скрыть сессии";
    
      timeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        if (tableTimerSessionsOpenIds.has(node.id)) {
          tableTimerSessionsOpenIds.delete(node.id);
        } else {
          tableTimerSessionsOpenIds.add(node.id);
        }
    
        if (typeof render === "function") render();
      });
    
      const resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "table-timer-countdown-btn table-timer-countdown-reset";
      resetBtn.textContent = "◀◀";
      resetBtn.title = "Сбросить остаток таймера";
    
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        resetTimerRemaining(node, key);
      });
    
      top.appendChild(playBtn);
      top.appendChild(timeBtn);
      top.appendChild(resetBtn);
    
      wrap.appendChild(top);
    
      if (tableTimerSessionsOpenIds.has(node.id)) {
        const sessions = document.createElement("div");
        sessions.className = "table-time-sessions";
    
        const title = document.createElement("div");
        title.className = "table-time-sessions-title";
        title.textContent = "Сессии";
        sessions.appendChild(title);
    
        if (!state.sessions.length) {
          const empty = document.createElement("div");
          empty.className = "table-time-session-empty";
          empty.textContent = "сессий пока нет";
          sessions.appendChild(empty);
        } else {
          state.sessions
            .slice()
            .reverse()
            .forEach((session) => {
              const item = document.createElement("div");
              item.className = "table-time-session";
    
              const duration = document.createElement("div");
              duration.className = "table-time-session-duration";
              duration.textContent = formatDurationMs(session.durationMs);
    
              const range = document.createElement("div");
              range.className = "table-time-session-range";
              range.textContent = formatSessionRange(session);
    
              item.appendChild(duration);
              item.appendChild(range);
    
              sessions.appendChild(item);
            });
        }
    
        wrap.appendChild(sessions);
      }
    
      ensureTableTimeTicker();
    
      return wrap;
    }

    function makeTableCoverCell(node) {
      const td = document.createElement("td");
      td.className = "table-cover-cell";
      td.dataset.prop = "cover";
    
      const value = getTableProp(node, "cover");
    
      const wrap = document.createElement("div");
      wrap.className = "table-cover-wrap";
    
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "table-cover-file";
      fileInput.hidden = true;
    
      function selectNode(e) {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      }
    
      td.addEventListener("click", selectNode);
      td.addEventListener("dblclick", (e) => e.stopPropagation());
    
      const uploadBtn = document.createElement("button");
      uploadBtn.type = "button";
      uploadBtn.className = "table-cover-btn";
      uploadBtn.textContent = value ? "заменить" : "загрузить";
    
      uploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
    
        fileInput.click();
      });
    
      fileInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
    
        if (!file) return;
    
        if (!file.type || !file.type.startsWith("image/")) {
          alert("Можно загрузить только изображение.");
          fileInput.value = "";
          return;
        }
    
        const reader = new FileReader();
    
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
    
          if (!dataUrl) return;
    
          setTableProp(node, "cover", dataUrl);
    
          fileInput.value = "";
    
          if (typeof render === "function") {
            render();
          }
        };
    
        reader.readAsDataURL(file);
      });
    
      if (value) {
        const previewBox = document.createElement("div");
        previewBox.className = "table-cover-preview-box";
    
        const img = document.createElement("img");
        img.className = "table-cover-preview";
        img.src = value;
        img.alt = "Обложка";
    
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "table-cover-remove";
        removeBtn.textContent = "×";
        removeBtn.title = "Удалить обложку";
    
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
    
          selectedId = node.id;
          treeHasFocus = true;
    
          setTableProp(node, "cover", "");
    
          if (typeof render === "function") {
            render();
          }
        });
    
        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);
    
        wrap.appendChild(previewBox);
      }
    
      wrap.appendChild(uploadBtn);
      wrap.appendChild(fileInput);
    
      td.appendChild(wrap);
    
      return td;
    }
    
    function appendTablePropertyCells(tr, node) {
      getAllTablePropertyColumns().forEach((column) => {
        tr.appendChild(makeTablePropCell(node, column));
      });
    }

    function normalizeTableTag(tag) {
      return String(tag || "").trim();
    }
    
    function isRealTableTag(tag) {
      const value = normalizeTableTag(tag);
      return !!value && value !== TABLE_TAG_ADD_VALUE;
    }
    
    function walkTableNodes(fn) {
      function walk(node) {
        if (!node) return;
    
        fn(node);
    
        (node.children || []).forEach(walk);
      }
    
      if (typeof root !== "undefined") {
        walk(root);
      }
    }
    
    function renameTableTagOption(oldTag) {
      const oldValue = normalizeTableTag(oldTag);
      if (!isRealTableTag(oldValue)) return false;
    
      const newValue = normalizeTableTag(
        window.prompt("Новое название тега", oldValue)
      );
    
      if (!newValue || newValue === oldValue) return false;
    
      if (typeof pushHistory === "function") {
        pushHistory();
      }
    
      tableExtraTagOptions = tableExtraTagOptions
        .map((tag) => tag === oldValue ? newValue : tag)
        .filter((tag, index, arr) => tag && arr.indexOf(tag) === index);
    
      if (!tableExtraTagOptions.includes(newValue)) {
        tableExtraTagOptions.push(newValue);
      }
    
      walkTableNodes((node) => {
        if (node.tableProps?.tag === oldValue) {
          node.tableProps.tag = newValue;
        }
      });
    
      if (typeof render === "function") render();
    
      return true;
    }
    
    function deleteTableTagOption(tag) {
      const value = normalizeTableTag(tag);
      if (!isRealTableTag(value)) return false;
    
      const ok = window.confirm(`Удалить тег "${value}" у всех объектов?`);
      if (!ok) return false;
    
      if (typeof pushHistory === "function") {
        pushHistory();
      }
    
      tableExtraTagOptions = tableExtraTagOptions.filter((tag) => tag !== value);
    
      walkTableNodes((node) => {
        if (node.tableProps?.tag === value) {
          node.tableProps.tag = "";
        }
      });
    
      if (typeof render === "function") render();
    
      return true;
    }

    function collectUsedTableTags() {
      const tags = new Set();
    
      function walk(node) {
        if (!node) return;
    
        const tag = node.tableProps?.tag;
    
        if (tag && tag !== TABLE_TAG_ADD_VALUE) {
          tags.add(tag);
        }
    
        (node.children || []).forEach(walk);
      }
    
      if (typeof root !== "undefined") {
        walk(root);
      }
    
      tableExtraTagOptions.forEach((tag) => {
        if (tag) tags.add(tag);
      });
    
      return Array.from(tags);
    }
    
    function addTableTagOption(tag) {
      const value = String(tag || "").trim();
    
      if (!value) return "";
    
      if (!tableExtraTagOptions.includes(value)) {
        tableExtraTagOptions.push(value);
      }
    
      return value;
    }
    
    function getTableTagOptions() {
      const tags = collectUsedTableTags();
    
      return [
        { value: "", label: "нет" },
        ...tags.map((tag) => ({
          value: tag,
          label: tag,
        })),
        { value: TABLE_TAG_ADD_VALUE, label: "добавить вариант" },
      ];
    }

    function makeTablePropSelect(node, column) {
      const select = document.createElement("select");
      select.className = "table-prop-select";
    
      const currentValue = getTableProp(node, column.key);
    
      const options =
        typeof column.options === "function"
          ? column.options(node)
          : (column.options || []);
    
      options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        select.appendChild(opt);
      });
    
      if (
        currentValue &&
        !Array.from(select.options).some((opt) => opt.value === currentValue)
      ) {
        const opt = document.createElement("option");
        opt.value = currentValue;
        opt.textContent = currentValue;
    
        const addOption = select.querySelector(
          `option[value="${TABLE_TAG_ADD_VALUE}"]`
        );
    
        if (addOption) {
          select.insertBefore(opt, addOption);
        } else {
          select.appendChild(opt);
        }
      }
    
      select.value = currentValue || "";
    
      select.addEventListener("click", (e) => {
        e.stopPropagation();
    
        selectedId = node.id;
        treeHasFocus = true;
      });
    
      select.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
    
      select.addEventListener("keydown", (e) => {
        e.stopPropagation();
    
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
    
          if (select.value !== TABLE_TAG_ADD_VALUE) {
            setTableProp(node, column.key, select.value);
          }
    
          select.blur();
        }
      });
    
      select.addEventListener("change", () => {
        if (column.key === "tag" && select.value === TABLE_TAG_ADD_VALUE) {
          const oldValue = getTableProp(node, column.key) || "";
          const newTag = window.prompt("Новый тег", "");
    
          if (!newTag || !newTag.trim()) {
            select.value = oldValue;
            return;
          }
    
          const tagValue = addTableTagOption(newTag);
    
          setTableProp(node, column.key, tagValue);
    
          render();
          return;
        }
    
        setTableProp(node, column.key, select.value);
      });
    
      if (column.key === "tag") {
        const wrap = document.createElement("div");
        wrap.className = "table-tag-control";
    
        const renameBtn = document.createElement("button");
        renameBtn.type = "button";
        renameBtn.className = "table-tag-action-btn";
        renameBtn.textContent = "переименовать";
    
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "table-tag-action-btn";
        deleteBtn.textContent = "удалить";
    
        function syncTagButtons() {
          const hasTag = isRealTableTag(select.value);
    
          renameBtn.disabled = !hasTag;
          deleteBtn.disabled = !hasTag;
        }
    
        syncTagButtons();
    
        select.addEventListener("change", syncTagButtons);
    
        renameBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
    
          renameTableTagOption(select.value);
        });
    
        deleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
    
          deleteTableTagOption(select.value);
        });
    
        wrap.addEventListener("click", (e) => {
          e.stopPropagation();
    
          selectedId = node.id;
          treeHasFocus = true;
        });
    
        wrap.appendChild(select);
        wrap.appendChild(renameBtn);
        wrap.appendChild(deleteBtn);
    
        return wrap;
      }
    
      return select;
    }
  
    function renderTableRow(node, ordinalPath) {
      const tr = document.createElement("tr");
      tr.className = node.id === selectedId ? "is-selected" : "";
  
      const idTd = document.createElement("td");
      idTd.textContent = "";

      const markTd = document.createElement("td");
      markTd.className = "table-mark-cell";

      if (window.markProperty?.buildMarkDot) {
        markTd.appendChild(window.markProperty.buildMarkDot(node.id));
      }
  
      const ordTd = document.createElement("td");
      const isFocusedRoot =
        window.objectFocus?.getFocusedRootId?.() === node.id;

      ordTd.textContent = isFocusedRoot
        ? ""
        : (ordinalPath.length ? ordinalPath.join(".") : "0");

        const iconTd = makeTablePropCell(node, TABLE_ICON_COLUMN);
iconTd.classList.add("table-icon-cell");

const coverTd = makeTableCoverCell(node);
  
      const levelTd = document.createElement("td");
      levelTd.textContent = DEFAULT_NAME[node.level] || `Уровень ${node.level}`;
  
      const nameTd = document.createElement("td");
  
      const row = document.createElement("div");
      row.className = "table-name-row row" + ((treeHasFocus && node.id === selectedId) ? " sel" : "");
      row.dataset.id = node.id;
      row.tabIndex = 0;
  
      const label = document.createElement("span");
      label.className = "label";
  
      if (node.nameHtml) label.innerHTML = node.nameHtml;
      else label.textContent = node.name || "";
  
      row.appendChild(label);
  
      const act = document.createElement("span");
      act.className = "act";
  
      {
        const plus = makeBtn("+", (e) => {
          e.stopPropagation();
          selectedId = node.id;
          addSibling(node.id);
        });
        act.appendChild(plus);
      }
  
      {
        const rename = makeBtn("..", (e) => {
          e.stopPropagation();
          selectedId = node.id;
          treeHasFocus = true;
          render();
          startRename(node.id);
        });
        act.appendChild(rename);
      }
  
      if (canHaveChild(node)) {
        const child = makeBtn(">", (e) => {
          e.stopPropagation();
          selectedId = node.id;
          addChild(node.id);
        });
        act.appendChild(child);
      }
  
      if (node.id !== root.id) {
        const del = makeBtn("x", (e) => {
          e.stopPropagation();
          selectedId = node.id;
          removeSelected();
        });
        act.appendChild(del);
      }
  
      row.appendChild(act);
  
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedId = node.id;
        treeHasFocus = true;
        row.focus({ preventScroll: true });
        render();
      });
  
      row.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        selectedId = node.id;
        treeHasFocus = true;
        render();
        startRename(node.id);
      });
  
      row.addEventListener("keydown", (e) => {
        if (isTreeLocked()) return;
  
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
  
        if (isHotkey(e, "navUp")) {
          e.preventDefault();
          selectedId = node.id;
          moveSelection(-1);
          return;
        }
  
        if (isHotkey(e, "navDown")) {
          e.preventDefault();
          selectedId = node.id;
          moveSelection(+1);
          return;
        }
  
        if (isHotkey(e, "navLeft")) {
          e.preventDefault();
          selectedId = node.id;
          goParent(node.id);
          return;
        }
  
        if (isHotkey(e, "navRight")) {
          e.preventDefault();
          selectedId = node.id;
          goDeeper(node.id);
          return;
        }
  
        if (isHotkey(e, "moveUp")) {
          e.preventDefault();
          selectedId = node.id;
          moveByVisibleOrder(-1);
          return;
        }
  
        if (isHotkey(e, "moveDown")) {
          e.preventDefault();
          selectedId = node.id;
          moveByVisibleOrder(+1);
          return;
        }
  
        if (isHotkey(e, "indent")) {
          e.preventDefault();
          selectedId = node.id;
          indentNode(node.id);
          return;
        }
  
        if (isHotkey(e, "outdent")) {
          e.preventDefault();
          selectedId = node.id;
          outdentNode(node.id);
          return;
        }
  
        if (isHotkey(e, "rename")) {
          e.preventDefault();
          selectedId = node.id;
          treeHasFocus = true;
          render();
          startRename(node.id);
          return;
        }
  
        if (isHotkey(e, "delete")) {
          e.preventDefault();
          selectedId = node.id;
          removeSelected();
          return;
        }
  
        if (isHotkey(e, "addChild")) {
          e.preventDefault();
          selectedId = node.id;
          addChild(node.id);
          return;
        }
  
        if (isHotkey(e, "addSibling")) {
          e.preventDefault();
        
          const focusedRootId = window.objectFocus?.getFocusedRootId?.();
          const isFocusedRoot = !!focusedRootId && focusedRootId === node.id;
        
          selectedId = node.id;
        
          if (isFocusedRoot) {
            addChild(node.id);
          } else {
            addSibling(node.id);
          }
        
          return;
        }
  
        if (isHotkey(e, "addCaption")) {
          e.preventDefault();
          selectedId = node.id;
          addCaption(node.id);
          return;
        }
      });
  
      nameTd.appendChild(row);
  
      const notesTd = document.createElement("td");
      notesTd.className = "table-notes-cell";
      renderCaptions(node, notesTd);
  
      if (!node.captions || !node.captions.length) {
        notesTd.textContent = "--";
      }
  
      tr.append(idTd, markTd, ordTd, iconTd, coverTd, levelTd, nameTd, notesTd);

      appendTablePropertyCells(tr, node);
  
      return tr;
    }
  })();