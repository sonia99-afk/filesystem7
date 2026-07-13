(function () {
    if (typeof window === "undefined") return;

    const TABLE_TEXT_COLUMN = {
      key: "text",
      title: "Текст",
      inputType: "text",
      placeholder: "",
    };
    
    /* =========================================================
       TABLE DATE / TIME COLUMNS
       Колонки таблицы, связанные с датами и временем.
    
       Используется для:
       - Дата начала
       - Время начала
       - Дата завершения
       - Время завершения
       - Диапазон дат
       - Диапазон времени
       - Дата + время начала
       - Дата + время завершения
       - Полный диапазон дата/время
  
    ========================================================= */
    
    const TABLE_START_DATE_COLUMN = {
      key: "startDate",
      title: "Дата начала",
      inputType: "date",
    };
    
    const TABLE_START_TIME_COLUMN = {
      key: "startTime",
      title: "Время начала",
      inputType: "time",
    };
    
    const TABLE_END_DATE_COLUMN = {
      key: "endDate",
      title: "Дата завершения",
      inputType: "date",
    };
    
    const TABLE_END_TIME_COLUMN = {
      key: "endTime",
      title: "Время завершения",
      inputType: "time",
    };
    
    const TABLE_DATE_TIME_PROPERTY_COLUMNS = [
      TABLE_START_DATE_COLUMN,
      TABLE_START_TIME_COLUMN,
      TABLE_END_DATE_COLUMN,
      TABLE_END_TIME_COLUMN,
    ];
    
    const TABLE_DATE_RANGE_COLUMN = {
      key: "dateRange",
      title: "Дата начала и дата завершения",
      inputType: "dateRange",
      startKey: "startDate",
      endKey: "endDate",
    };
    
    const TABLE_TIME_RANGE_COLUMN = {
      key: "timeRange",
      title: "Время начала и время завершения",
      inputType: "timeRange",
      startKey: "startTime",
      endKey: "endTime",
    };
    
    const TABLE_START_DATETIME_COLUMN = {
      key: "startDateTime",
      title: "Дата и время начала",
      inputType: "dateTimePair",
      dateKey: "startDate",
      timeKey: "startTime",
    };
    
    const TABLE_END_DATETIME_COLUMN = {
      key: "endDateTime",
      title: "Дата и время завершения",
      inputType: "dateTimePair",
      dateKey: "endDate",
      timeKey: "endTime",
    };
    
    const TABLE_FULL_DATETIME_RANGE_COLUMN = {
      key: "fullDateTimeRange",
      title: "Дата, время начала и завершения",
      inputType: "dateTimeRangePair",
      startDateKey: "startDate",
      startTimeKey: "startTime",
      endDateKey: "endDate",
      endTimeKey: "endTime",
    };
    
    /* ======================= /TABLE DATE / TIME COLUMNS ======================= */
    
    const TABLE_PROPERTY_COLUMNS = [
      TABLE_TEXT_COLUMN,
      ...TABLE_DATE_TIME_PROPERTY_COLUMNS,
    ];

    const TABLE_TAG_ADD_VALUE = "__add_tag__";

let tableExtraTagOptions = [];

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


/* =========================================================
   TABLE TIME / TIMER COLUMNS
   Колонки таблицы, связанные со счётчиком времени и таймером.

   Используется для:
   - Счётчик времени
   - Время таймера
   - Оставшееся время
========================================================= */

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

/* ======================= /TABLE TIME / TIMER COLUMNS ======================= */

function getAllTablePropertyColumns() {
  return [
    ...TABLE_PROPERTY_COLUMNS,

    TABLE_START_DATETIME_COLUMN,
    TABLE_END_DATETIME_COLUMN,

    TABLE_DATE_RANGE_COLUMN,
    TABLE_TIME_RANGE_COLUMN,

    TABLE_FULL_DATETIME_RANGE_COLUMN,

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


        const oldMinWidth = host.style.minWidth;
        const oldScrollWidth = host.scrollWidth;

        if (oldScrollWidth) {
          host.style.minWidth = `${oldScrollWidth}px`;
        }

        host.replaceChildren(wrap);

        requestAnimationFrame(() => {
          host.style.minWidth = oldMinWidth;
        });

        layoutTableCollapseColumn(host, wrap);
        ensureTableCellTabNavigation();
        ensureTableTimerCellsEnterHotkey();
        ensureTableUploadCellsEnterHotkey();
          
      if (treeHasFocus) {
        const selectedRow = host.querySelector(`.row[data-id="${cssEscape(selectedId)}"]`);
        selectedRow?.focus({ preventScroll: true });
      }

      updateTableDescendantRowHighlights();

requestAnimationFrame(() => {
  updateTableDescendantRowHighlights();
  ensureTableDescendantHighlightWatcher();
});
    };


    /* =========================================================
   TABLE DATE / TIME CELLS
   Общая логика date/time-ячеек таблицы.

   Здесь держим:
   - синхронизацию date/time значений
   - форматирование дат и времени
   - валидацию дат и времени
   - readonly-составные ячейки
   - compact date/time editor
========================================================= */
function syncTableDateTimeLinkedControlsForKey(node, key) {
  if (!node || !key) return;

  syncTableSingleInputsForKey(node, key);
  syncTableRangeControlsForKey(node, key);
  syncTableDateTimeControlsForKey(node, key);
  syncTableFullDateTimeRangeControlsForKey(node, key);
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

  host.querySelectorAll(".table-prop-cell[data-id]").forEach((cell) => {
    if (cell.dataset.id !== node.id) return;
    if (cell.dataset.prop !== key) return;

    const column = getTableColumnByKey(key);

    if (!column) return;

    const input = cell.querySelector(".table-prop-input");

    if (input && document.activeElement !== input) {
      input.value = getTableProp(node, key);
    }

    if (
      cell.classList.contains("table-direct-cell") &&
      !cell.classList.contains("is-editing")
    ) {
      renderDirectTableCellView(cell, node, column);
    }
  });
}

function syncTableDateTimeControlsForKey(node, key) { 
  const host = document.getElementById("tree");
  if (!host || !node?.id || !key) return;

  host.querySelectorAll(".table-datetime-control[data-id]").forEach((wrap) => {
    if (wrap.dataset.id !== node.id) return;

    const dateKey = wrap.dataset.dateKey;
    const timeKey = wrap.dataset.timeKey;

    if (key !== dateKey && key !== timeKey) return;

    const dateInput = wrap.querySelector('.table-datetime-input[data-role="date"]');
    const timeInput = wrap.querySelector('.table-datetime-input[data-role="time"]');
    const view = wrap.querySelector(".table-datetime-view");

    if (dateInput && document.activeElement !== dateInput) {
      dateInput.value = getTableProp(node, dateKey);
    }

    if (timeInput && document.activeElement !== timeInput) {
      timeInput.value = getTableProp(node, timeKey);
    }

    if (view) {
      view.textContent = getTableDateTimeViewText(
        node,
        {
          dateKey,
          timeKey,
        }
      );
    }
  });
}

function syncTableFullDateTimeRangeControlsForKey(node, key) { 
  const host = document.getElementById("tree");
  if (!host || !node?.id || !key) return;

  host.querySelectorAll(".table-full-datetime-range-control[data-id]").forEach((wrap) => {
    if (wrap.dataset.id !== node.id) return;

    const startDateKey = wrap.dataset.startDateKey;
    const startTimeKey = wrap.dataset.startTimeKey;
    const endDateKey = wrap.dataset.endDateKey;
    const endTimeKey = wrap.dataset.endTimeKey;

    if (
      key !== startDateKey &&
      key !== startTimeKey &&
      key !== endDateKey &&
      key !== endTimeKey
    ) {
      return;
    }

    const startDateInput = wrap.querySelector('.table-full-datetime-range-input[data-role="start-date"]');
    const startTimeInput = wrap.querySelector('.table-full-datetime-range-input[data-role="start-time"]');
    const endDateInput = wrap.querySelector('.table-full-datetime-range-input[data-role="end-date"]');
    const endTimeInput = wrap.querySelector('.table-full-datetime-range-input[data-role="end-time"]');
    const view = wrap.querySelector(".table-full-datetime-range-view");

    if (startDateInput && document.activeElement !== startDateInput) {
      startDateInput.value = getTableProp(node, startDateKey);
    }

    if (startTimeInput && document.activeElement !== startTimeInput) {
      startTimeInput.value = getTableProp(node, startTimeKey);
    }

    if (endDateInput && document.activeElement !== endDateInput) {
      endDateInput.value = getTableProp(node, endDateKey);
    }

    if (endTimeInput && document.activeElement !== endTimeInput) {
      endTimeInput.value = getTableProp(node, endTimeKey);
    }

    if (view) {
      view.textContent = getTableFullDateTimeRangeViewText(node, {
        startDateKey,
        startTimeKey,
        endDateKey,
        endTimeKey,
      });
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
    syncTableDateTimeLinkedControlsForKey(node, startKey);
    syncTableDateTimeLinkedControlsForKey(node, endKey);
  });
}


function isValidTableDateValue(value) { 
  const str = String(value || "").trim();

  if (!str) return true;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Защита от странных дат вида 02.05.0002,
  // которые браузер может получить при вводе одной цифры.
  if (year < 1900 || year > 2100) return false;

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidTableTimeValue(value) { 
  const str = String(value || "").trim();

  if (!str) return true;

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
}

function isValidDirectDateTimeValue(column, value) { 
  if (!column) return true;

  if (column.inputType === "date") {
    return isValidTableDateValue(value);
  }

  if (column.inputType === "time") {
    return isValidTableTimeValue(value);
  }

  return true;
}

function isValidTableCompositeInput(input) { 
  if (!input) return true;

  if (input.type === "date") {
    return isValidTableDateValue(input.value);
  }

  if (input.type === "time") {
    return isValidTableTimeValue(input.value);
  }

  return true;
}

function getFirstInvalidTableCompositeInput(inputs) {
  return inputs.find((input) => !isValidTableCompositeInput(input)) || null;
}

function makeTableCompositeDateTimeControl(node, config) {
  const wrap = document.createElement("div");

  wrap.className = [
    config.controlClass || "",
    "table-composite-datetime-control",
  ].filter(Boolean).join(" ");

  wrap.dataset.id = node.id;

  Object.entries(config.dataset || {}).forEach(([key, value]) => {
    wrap.dataset[key] = value;
  });

  const view = document.createElement("div");
  view.className = [
    config.viewClass || "",
    "table-composite-datetime-view",
  ].filter(Boolean).join(" ");

  view.title = config.title || "";

  const editor = document.createElement("div");
  editor.className = "table-composite-datetime-editor";

  const inputs = [];

  function syncView() {
    config.items.forEach((item, index) => {
      const input = inputs[index];

      if (input && document.activeElement !== input) {
        input.value = getTableProp(node, item.key);
      }
    });

    view.textContent = config.getViewText();
  }

  function restoreCellFocus() {
    requestAnimationFrame(() => {
      const td = wrap.closest("td");

      if (!td || !document.body.contains(td)) return;

      window.tableCellNav?.selectCell?.(td, {
        focus: true,
        scroll: false,
      });
    });
  }

  function closeEditor(options = {}) {
    syncView();
    wrap.classList.remove("is-editing", "is-invalid");

    inputs.forEach((input) => {
      input.classList.remove("is-invalid");
    });

    if (options.restoreFocus !== false) {
      restoreCellFocus();
    }
  }

  function markInvalid() {
    wrap.classList.add("is-invalid");

    inputs.forEach((input) => {
      if (!isValidTableCompositeInput(input)) {
        input.classList.add("is-invalid");
      } else {
        input.classList.remove("is-invalid");
      }
    });

    const firstInvalid = getFirstInvalidTableCompositeInput(inputs);

    if (firstInvalid) {
      requestAnimationFrame(() => {
        firstInvalid.focus({
          preventScroll: true,
        });
      });
    }
  }

  function commit() {
    if (inputs.some((input) => !isValidTableCompositeInput(input))) {
      markInvalid();
      return false;
    }

    const values = {};

    config.items.forEach((item, index) => {
      values[item.key] = String(inputs[index]?.value || "").trim();
    });

    config.commit(values);

    closeEditor();

    return true;
  }

  function openEditor(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    selectedId = node.id;
    treeHasFocus = true;

    syncView();

    wrap.classList.add("is-editing");

    requestAnimationFrame(() => {
      inputs[0]?.focus({
        preventScroll: true,
      });
    });
  }

  wrap.openEditor = openEditor;

  config.items.forEach((item, index) => {
    if (index > 0) {
      const separator = document.createElement("span");
      separator.className = "table-composite-datetime-separator";
      separator.textContent = item.separator || "→";
      editor.appendChild(separator);
    }

    const input = document.createElement("input");
    input.className = [
      "table-composite-datetime-input",
      item.inputClass || "",
    ].filter(Boolean).join(" ");

    input.type = item.type;
    input.value = getTableProp(node, item.key);
    input.dataset.role = item.role || item.key;

    input.addEventListener("click", (e) => {
      e.stopPropagation();

      selectedId = node.id;
      treeHasFocus = true;
    });

    input.addEventListener("dblclick", (e) => {
      e.stopPropagation();
    });

    input.addEventListener("input", () => {
      wrap.classList.remove("is-invalid");
      input.classList.remove("is-invalid");
    });

    input.addEventListener("keydown", (e) => {
      e.stopPropagation();

      if (e.key === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        commit();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        closeEditor();
      }
    });

    inputs.push(input);
    editor.appendChild(input);
  });

  wrap.addEventListener("dblclick", openEditor);

  wrap.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!wrap.contains(document.activeElement)) {
        commit();
      }
    }, 0);
  });

  syncView();

  wrap.appendChild(view);
  wrap.appendChild(editor);

  return wrap;
}

function makeTableRangeControl(node, column, inputType) {
  return makeTableCompositeDateTimeControl(node, {
    controlClass: "table-range-control",
    viewClass: "table-range-view",
    title: column.title || "Изменить период",

    dataset: {
      startKey: column.startKey,
      endKey: column.endKey,
      inputType,
    },

    items: [
      {
        key: column.startKey,
        type: inputType,
        role: "start",
        inputClass: "table-range-input",
      },
      {
        key: column.endKey,
        type: inputType,
        role: "end",
        inputClass: "table-range-input",
        separator: "→",
      },
    ],

    getViewText() {
      return getTableRangeViewText(node, column, inputType);
    },

    commit(values) {
      setTableRangeProps(
        node,
        column.startKey,
        column.endKey,
        values[column.startKey],
        values[column.endKey]
      );
    },
  });
}

function makeTableDateTimeControl(node, column) {
  return makeTableCompositeDateTimeControl(node, {
    controlClass: "table-datetime-control",
    viewClass: "table-datetime-view",
    title: column.title || "Изменить дату и время",

    dataset: {
      dateKey: column.dateKey,
      timeKey: column.timeKey,
    },

    items: [
      {
        key: column.dateKey,
        type: "date",
        role: "date",
        inputClass: "table-datetime-input",
      },
      {
        key: column.timeKey,
        type: "time",
        role: "time",
        inputClass: "table-datetime-input",
        separator: "",
      },
    ],

    getViewText() {
      return getTableDateTimeViewText(node, column);
    },

    commit(values) {
      setTableDateTimeProps(
        node,
        column.dateKey,
        column.timeKey,
        values[column.dateKey],
        values[column.timeKey]
      );
    },
  });
}

function makeTableFullDateTimeRangeControl(node, column) {
  return makeTableCompositeDateTimeControl(node, {
    controlClass: "table-full-datetime-range-control",
    viewClass: "table-full-datetime-range-view",
    title: column.title || "Изменить полный период",

    dataset: {
      startDateKey: column.startDateKey,
      startTimeKey: column.startTimeKey,
      endDateKey: column.endDateKey,
      endTimeKey: column.endTimeKey,
    },

    items: [
      {
        key: column.startDateKey,
        type: "date",
        role: "start-date",
        inputClass: "table-full-datetime-range-input",
      },
      {
        key: column.startTimeKey,
        type: "time",
        role: "start-time",
        inputClass: "table-full-datetime-range-input",
        separator: "",
      },
      {
        key: column.endDateKey,
        type: "date",
        role: "end-date",
        inputClass: "table-full-datetime-range-input",
        separator: "→",
      },
      {
        key: column.endTimeKey,
        type: "time",
        role: "end-time",
        inputClass: "table-full-datetime-range-input",
        separator: "",
      },
    ],

    getViewText() {
      return getTableFullDateTimeRangeViewText(node, column);
    },

    commit(values) {
      setTableFullDateTimeRangeProps(
        node,
        column.startDateKey,
        column.startTimeKey,
        column.endDateKey,
        column.endTimeKey,
        values[column.startDateKey],
        values[column.startTimeKey],
        values[column.endDateKey],
        values[column.endTimeKey]
      );
    },
  });
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


function formatTableTimeCompact(value) {
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

function getTableDateTimeViewText(node, column) {
  const dateValue = getTableProp(node, column.dateKey);
  const timeValue = getTableProp(node, column.timeKey);

  const dateText = formatTableDateCompact(dateValue);
  const timeText = formatTableTimeCompact(timeValue);

  if (!dateText && !timeText) return "";
  if (dateText && !timeText) return dateText;
  if (!dateText && timeText) return timeText;

  return `${dateText} ${timeText}`;
}

function getTableFullDateTimeRangeViewText(node, column) {
  const startDate = formatTableDateCompact(getTableProp(node, column.startDateKey));
  const startTime = formatTableTimeCompact(getTableProp(node, column.startTimeKey));
  const endDate = formatTableDateCompact(getTableProp(node, column.endDateKey));
  const endTime = formatTableTimeCompact(getTableProp(node, column.endTimeKey));

  const startText = [startDate, startTime].filter(Boolean).join(" ");
  const endText = [endDate, endTime].filter(Boolean).join(" ");

  if (!startText && !endText) return "";
  if (startText && !endText) return `${startText} →`;
  if (!startText && endText) return `→ ${endText}`;

  return `${startText} → ${endText}`;
}


function setTableFullDateTimeRangeProps(
  node,
  startDateKey,
  startTimeKey,
  endDateKey,
  endTimeKey,
  startDateValue,
  startTimeValue,
  endDateValue,
  endTimeValue
) {
  const props = ensureTableProps(node);

  const oldStartDate = props[startDateKey] || "";
  const oldStartTime = props[startTimeKey] || "";
  const oldEndDate = props[endDateKey] || "";
  const oldEndTime = props[endTimeKey] || "";

  if (
    oldStartDate === startDateValue &&
    oldStartTime === startTimeValue &&
    oldEndDate === endDateValue &&
    oldEndTime === endTimeValue
  ) {
    return;
  }

  if (typeof pushHistory === "function" && typeof snapshot === "function") {
    pushHistory(snapshot());
  }

  props[startDateKey] = startDateValue;
  props[startTimeKey] = startTimeValue;
  props[endDateKey] = endDateValue;
  props[endTimeKey] = endTimeValue;

  requestAnimationFrame(() => {
    [startDateKey, startTimeKey, endDateKey, endTimeKey].forEach((key) => {
      syncTableDateTimeLinkedControlsForKey(node, key);
    });
  });
}

function setTableDateTimeProps(node, dateKey, timeKey, dateValue, timeValue) {
  const props = ensureTableProps(node);

  const oldDate = props[dateKey] || "";
  const oldTime = props[timeKey] || "";

  if (oldDate === dateValue && oldTime === timeValue) return;

  if (typeof pushHistory === "function" && typeof snapshot === "function") {
    pushHistory(snapshot());
  }

  props[dateKey] = dateValue;
  props[timeKey] = timeValue;

  requestAnimationFrame(() => {
    syncTableDateTimeLinkedControlsForKey(node, dateKey);
    syncTableDateTimeLinkedControlsForKey(node, timeKey);
  });
}
/* ======================= /TABLE DATE / TIME CELLS ======================= */



/* =========================================================
   TABLE TIME / TIMER CELLS
   Логика последних трёх столбцов таблицы.

   Здесь держим:
   - счётчик времени
   - сессии счётчика времени
   - таймер
   - длительность таймера
   - оставшееся время таймера
   - обновление видимых счётчиков
========================================================= */

const tableTimeSessionsOpenIds = new Set();
let tableTimeTicker = null;

const tableTimerSessionsOpenIds = new Set();

const TIMER_STEP_MS = 5 * 60 * 1000;

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

    function toggleTimeCounterFromCell(td) {
  if (!td) return false;

  const wrap = td.querySelector(".table-time-counter");
  const id = td.dataset.id || wrap?.dataset?.id;
  const key = td.dataset.prop || wrap?.dataset?.key || "timeCounter";

  if (!id || !key) return false;

  const found = findWithParent(root, id);
  const node = found?.node;

  if (!node) return false;

  selectedId = node.id;
  treeHasFocus = true;

  const current = getTimeCounterState(node, key);

  if (current.running) {
    pauseTimeCounter(node, key);
  } else {
    startTimeCounter(node, key);
  }

  return true;
}

function isTableTimeCounterTypingTarget(el) {
  if (!el) return false;

  const tag = (el.tagName || "").toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

// function handleTableTimeCounterEnter(e) {
//   if (e.key !== "Enter" && e.code !== "NumpadEnter") return;
//   if (e.ctrlKey || e.metaKey || e.altKey) return;
//   if (isTableTimeCounterTypingTarget(e.target)) return;

//   const host = document.getElementById("tree");
//   if (!host) return;

//   const selectedCell = host.querySelector("td.table-cell-selected.table-time-cell");
//   if (!selectedCell) return;

//   const targetCell = e.target?.closest?.("td");

//   if (targetCell && host.contains(e.target) && targetCell !== selectedCell) {
//     return;
//   }

//   e.preventDefault();
//   e.stopPropagation();

//   toggleTimeCounterFromCell(selectedCell);
// }

function ensureTableTimeCounterEnterHotkey() {
  if (document.__tableTimeCounterEnterHotkeyBound) return;

  document.__tableTimeCounterEnterHotkeyBound = true;

  document.addEventListener("keydown", handleTableTimeCounterEnter, true);
}

function toggleTimerRemainingFromCell(td) {
  if (!td) return false;

  const wrap = td.querySelector(".table-timer-countdown");
  const id = td.dataset.id || wrap?.dataset?.id;
  const key = td.dataset.prop || wrap?.dataset?.key || "timer";

  if (!id || !key) return false;

  const found = findWithParent(root, id);
  const node = found?.node;

  if (!node) return false;

  selectedId = node.id;
  treeHasFocus = true;

  const current = getTimerState(node, key);

  if (current.running) {
    pauseTimerRemaining(node, key);
  } else {
    startTimerRemaining(node, key);
  }

  return true;
}

// function handleTableTimerDurationEnter(e) {
//   if (e.key !== "Enter" && e.code !== "NumpadEnter") return;
//   if (e.ctrlKey || e.metaKey || e.altKey) return;

//   // Если курсор уже внутри input/select/textarea — не мешаем редактору
//   if (isTableTimeCounterTypingTarget(e.target)) return;

//   const host = document.getElementById("tree");
//   if (!host) return;

//   const selectedCell = host.querySelector("td.table-cell-selected.table-timer-duration-cell");
//   if (!selectedCell) return;

//   const targetCell = e.target?.closest?.("td");

//   if (targetCell && host.contains(e.target) && targetCell !== selectedCell) {
//     return;
//   }

//   e.preventDefault();
//   e.stopPropagation();

//   openTimerDurationEditorFromCell(selectedCell);
// }

function ensureTableTimerDurationEnterHotkey() {
  if (document.__tableTimerDurationEnterHotkeyBound) return;

  document.__tableTimerDurationEnterHotkeyBound = true;

  document.addEventListener("keydown", handleTableTimerDurationEnter, true);
}

function getSelectedTableTimerCell() {
  const host = document.getElementById("tree");
  if (!host) return null;

  return host.querySelector(
    [
      "td.table-cell-selected.table-time-cell",
      "td.table-cell-selected.table-timer-duration-cell",
      "td.table-cell-selected.table-timer-remaining-cell",
    ].join(",")
  );
}

function isTableTimerTypingTarget(el) {
  if (!el) return false;

  const tag = (el.tagName || "").toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

function isTableTimerActionElement(el) {
  if (!el) return false;

  const tag = (el.tagName || "").toLowerCase();

  return (
    tag === "button" ||
    el.classList?.contains("table-time-value") ||
    el.classList?.contains("table-timer-duration-value") ||
    el.classList?.contains("table-timer-countdown-value") ||
    el.getAttribute?.("role") === "button"
  );
}

function isTableCellActivateHotkey(e) {
  return !!window.tableCellNav?.isCellActivateHotkey?.(e);
}

function isNativeTableActionKey(e) {
  return (
    e.key === "Enter" ||
    e.code === "NumpadEnter" ||
    e.key === " " ||
    e.code === "Space"
  );
}

function stopTableActionKey(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();
}

function handleTableTimerCellsEnter(e) {
  const selectedCell = getSelectedTableTimerCell();
  if (!selectedCell) return;

  const active = document.activeElement;

  if (!active || !selectedCell.contains(active)) {
    return;
  }

  // ВАЖНО:
  // Если сейчас открыт внутренний input-редактор времени,
  // не перехватываем Enter/Backspace/цифры здесь.
  // Пусть input сам сохранит значение на Enter.
  if (isTableTimerTypingTarget(active) || isTableTimerTypingTarget(e.target)) {
    return;
  }

  if (!isTableTimerActionElement(active)) {
    return;
  }

  // Если хоткей переназначили, старый Enter/Space больше не должен
  // нативно нажимать кнопку внутри timer-ячейки.
  if (isNativeTableActionKey(e) && !isTableCellActivateHotkey(e)) {
    stopTableActionKey(e);
    return;
  }

  if (!isTableCellActivateHotkey(e)) {
    return;
  }

  stopTableActionKey(e);
  active.click();
}

function ensureTableTimerCellsEnterHotkey() {
  if (document.__tableTimerCellsEnterHotkeyBound) return;

  document.__tableTimerCellsEnterHotkeyBound = true;

  document.addEventListener("keydown", handleTableTimerCellsEnter, true);
}

function getSelectedTableUploadCell() {
  const host = document.getElementById("tree");
  if (!host) return null;

  return host.querySelector(
    [
      "td.table-cell-selected.table-upload-cell",
      "td.table-cell-selected.table-cover-cell",
      "td.table-cell-selected.table-extra-image-cell",
      "td.table-cell-selected.table-file-cell",
    ].join(",")
  );
}

function isTableUploadTypingTarget(el) {
  if (!el) return false;

  const tag = (el.tagName || "").toLowerCase();

  return (
    tag === "input" && el.type !== "file" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

function isTableUploadActionElement(el) {
  if (!el) return false;

  const tag = (el.tagName || "").toLowerCase();

  return (
    tag === "button" ||
    tag === "label" ||
    el.getAttribute?.("role") === "button"
  );
}

function getDefaultUploadActionElement(td) {
  if (!td) return null;

  // По Enter без Tab не удаляем файл случайно.
  // Сначала ищем кнопку загрузки/замены.
  return (
    td.querySelector(".table-cover-btn") ||
    td.querySelector(".table-image-btn") ||
    td.querySelector(".table-file-btn") ||
    td.querySelector("button:not([disabled])")
  );
}

function handleTableUploadCellsEnter(e) {
  if (isTableUploadTypingTarget(e.target)) return;

  const selectedCell = getSelectedTableUploadCell();
  if (!selectedCell) return;

  const active = document.activeElement;

  // Если Tab поставил фокус на кнопку внутри upload-ячейки,
  // хоткей должен нажать именно её: крестик, загрузку, замену.
  if (
    active &&
    selectedCell.contains(active) &&
    isTableUploadActionElement(active)
  ) {
    // Если хоткей переназначили, старый Enter/Space больше не должен
    // нативно нажимать кнопку.
    if (isNativeTableActionKey(e) && !isTableCellActivateHotkey(e)) {
      stopTableActionKey(e);
      return;
    }

    if (!isTableCellActivateHotkey(e)) {
      return;
    }

    stopTableActionKey(e);
    active.click();
    return;
  }

  // Если фокус просто на самой upload-ячейке,
  // хоткей открывает загрузку/замену, но не удаление.
  if (!isTableCellActivateHotkey(e)) {
    return;
  }

  const defaultAction = getDefaultUploadActionElement(selectedCell);
  if (!defaultAction) return;

  stopTableActionKey(e);
  defaultAction.click();
}

function ensureTableUploadCellsEnterHotkey() {
  if (document.__tableUploadCellsEnterHotkeyBound) return;

  document.__tableUploadCellsEnterHotkeyBound = true;

  document.addEventListener("keydown", handleTableUploadCellsEnter, true);
}

// function handleTableTimerRemainingEnter(e) {
//   if (e.key !== "Enter" && e.code !== "NumpadEnter") return;
//   if (e.ctrlKey || e.metaKey || e.altKey) return;
//   if (isTableTimeCounterTypingTarget(e.target)) return;

//   const host = document.getElementById("tree");
//   if (!host) return;

//   const selectedCell = host.querySelector("td.table-cell-selected.table-timer-remaining-cell");
//   if (!selectedCell) return;

//   const targetCell = e.target?.closest?.("td");

//   if (targetCell && host.contains(e.target) && targetCell !== selectedCell) {
//     return;
//   }

//   e.preventDefault();
//   e.stopPropagation();

//   toggleTimerRemainingFromCell(selectedCell);
// }

function ensureTableTimerRemainingEnterHotkey() {
  if (document.__tableTimerRemainingEnterHotkeyBound) return;

  document.__tableTimerRemainingEnterHotkeyBound = true;

  document.addEventListener("keydown", handleTableTimerRemainingEnter, true);
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

function formatTableTimerDurationMask(digits) {
  const clean = String(digits || "").replace(/\D/g, "").slice(0, 6);
  const masked = clean.padEnd(6, "-");

  return [
    masked.slice(0, 2),
    masked.slice(2, 4),
    masked.slice(4, 6),
  ].join(":");
}

function canAddTableTimerDurationDigit(digits, digit) {
  const position = digits.length;
  const number = Number(digit);

  if (position >= 6) return false;

  // 0-1: часы
  // 2-3: минуты
  // 4-5: секунды
  // первая цифра минут и секунд не может быть больше 5
  if ((position === 2 || position === 4) && number > 5) {
    return false;
  }

  return true;
}

function parseTableTimerDurationMask(digits) {
  const clean = String(digits || "").replace(/\D/g, "");

  if (clean.length !== 6) {
    return null;
  }

  const hours = Number(clean.slice(0, 2));
  const minutes = Number(clean.slice(2, 4));
  const seconds = Number(clean.slice(4, 6));

  if (minutes > 59 || seconds > 59) {
    return null;
  }

  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
}

function setTimerDurationManualValue(node, key, durationMs) {
  const state = getTimerState(node, key);

  const nextDurationMs = Math.max(0, Number(durationMs) || 0);
  const currentElapsedMs = getTimerElapsedMs(state);
  const nextElapsedMs = Math.min(currentElapsedMs, nextDurationMs);
  const shouldKeepRunning = state.running && nextElapsedMs < nextDurationMs;

  setTimerState(node, key, {
    ...state,
    durationMs: nextDurationMs,
    elapsedMs: nextElapsedMs,
    running: shouldKeepRunning,
    startedAt: shouldKeepRunning ? Date.now() : null,
  });

  if (typeof render === "function") {
    render();
  }
}

function openTimerDurationEditorFromCell(td) {
  if (!td) return false;

  const value = td.querySelector(".table-timer-duration-value");
  const id = td.dataset.id;
  const key = td.dataset.prop || "timer";

  if (!value || !id || !key) return false;

  // Если редактор уже открыт, просто фокусируем его
  if (value.classList.contains("table-duration-mask-editor")) {
    value.focus({
      preventScroll: true,
    });

    return true;
  }

  const found = findWithParent(root, id);
  const node = found?.node;

  if (!node) return false;

  selectedId = node.id;
  treeHasFocus = true;

  openTableTimerDurationMaskEditor(value, node, key);

  return true;
}

function openTableTimerDurationMaskEditor(valueEl, node, key) {
  if (!valueEl || !node || !key) return;

  const input = document.createElement("input");

  input.type = "text";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.className = "table-timer-duration-value table-duration-mask-editor";
  input.title = "Введите 6 цифр: 233412 → 23:34:12";

  let digits = "";
  let finished = false;

  function syncInput() {
    input.value = formatTableTimerDurationMask(digits);

    requestAnimationFrame(() => {
      const end = input.value.length;
      input.setSelectionRange?.(end, end);
    });
  }

  function markInvalid() {
    input.classList.add("is-invalid");

    requestAnimationFrame(() => {
      input.focus({
        preventScroll: true,
      });
    });
  }

  function clearInvalid() {
    input.classList.remove("is-invalid");
  }

  function cancel() {
    if (finished) return;

    finished = true;

    if (typeof render === "function") {
      render();
    }
  }

  function commit() {
    if (finished) return;

    // если пользователь ничего не ввёл — просто закрываем редактор
    if (!digits.length) {
      cancel();
      return;
    }

    const nextMs = parseTableTimerDurationMask(digits);

    if (nextMs === null) {
      markInvalid();
      return;
    }

    finished = true;
    setTimerDurationManualValue(node, key, nextMs);
  }

  function addDigit(digit) {
  if (!canAddTableTimerDurationDigit(digits, digit)) {
    markInvalid();
    return;
  }

  clearInvalid();

  digits += digit;
  syncInput();
}

  input.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  input.addEventListener("dblclick", (e) => {
    e.stopPropagation();
  });

input.addEventListener("keydown", (e) => {
  e.stopPropagation();

  if (/^\d$/.test(e.key)) {
    e.preventDefault();
    addDigit(e.key);
    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    clearInvalid();
    digits = digits.slice(0, -1);
    syncInput();
    return;
  }

  if (e.key === "Delete") {
    e.preventDefault();
    clearInvalid();
    digits = "";
    syncInput();
    return;
  }

  // Здесь оставляем обычное сохранение на Enter,
  // без связи с хоткеем "Переименовать".
  if (e.key === "Enter" || e.code === "NumpadEnter") {
    e.preventDefault();
    commit();
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    cancel();
    return;
  }

  // Разрешаем служебные клавиши.
  if (
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Home" ||
    e.key === "End"
  ) {
    return;
  }

  // Запрещаем буквы и любые другие печатные символы.
  if (e.key && e.key.length === 1) {
    e.preventDefault();
    clearInvalid();
    return;
  }
});

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    clearInvalid();

    const pasted = e.clipboardData?.getData("text") || "";
    const nextDigits = pasted.replace(/\D/g, "").slice(0, 6);

    let result = "";

    for (const digit of nextDigits) {
      if (!canAddTableTimerDurationDigit(result, digit)) {
        markInvalid();
        break;
      }

      result += digit;
    }

    digits = result;
    syncInput();
  });

  input.addEventListener("blur", () => {
    commit();
  });

  valueEl.replaceWith(input);

  syncInput();

  requestAnimationFrame(() => {
    input.focus({
      preventScroll: true,
    });
  });
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

  value.tabIndex = 0;
value.setAttribute("role", "button");

  value.title = "Ввести время вручную";

value.addEventListener("click", (e) => {
  const td = value.closest("td");

  // Если ячейка ещё не выбрана — не открываем редактор.
  // Даём клику всплыть выше, чтобы обычная логика таблицы выбрала ячейку.
  if (!td || !td.classList.contains("table-cell-selected")) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  selectedId = node.id;
  treeHasFocus = true;

  openTableTimerDurationMaskEditor(value, node, key);
});

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

/* ======================= /TABLE TIME / TIMER CELLS ======================= */












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

    function getTableRowNodeId(tr) {
      if (!tr) return "";
    
      const nameCell = tr.querySelector(".row[data-id]");
      return nameCell?.dataset?.id || "";
    }
    
    function collectTableDescendantIds(node, out = new Set()) {
      if (!node) return out;
    
      (node.children || []).forEach((child) => {
        if (!child?.id) return;
    
        out.add(child.id);
        collectTableDescendantIds(child, out);
      });
    
      return out;
    }
    
    function getCurrentTableSelectedRowId(host) {
      const selectedCell = host?.querySelector("td.table-cell-selected");
      const selectedTr = selectedCell?.closest("tr");
    
      return getTableRowNodeId(selectedTr) || selectedId || "";
    }
    
    function updateTableDescendantRowHighlights() {
      const host = document.getElementById("tree");
      if (!host) return;
    
      const selectedRowId = getCurrentTableSelectedRowId(host);
    
      host.querySelectorAll("tr.table-selected-descendant-row").forEach((tr) => {
        tr.classList.remove("table-selected-descendant-row");
      });
    
      if (!selectedRowId) return;
    
      const found =
        typeof findWithParent === "function"
          ? findWithParent(root, selectedRowId)
          : null;
    
      const selectedNode = found?.node;
      if (!selectedNode) return;
    
      const descendantIds = collectTableDescendantIds(selectedNode);
    
      if (!descendantIds.size) return;
    
      host.querySelectorAll(".structure-table tbody tr").forEach((tr) => {
        const rowId = getTableRowNodeId(tr);
    
        if (descendantIds.has(rowId)) {
          tr.classList.add("table-selected-descendant-row");
        }
      });
    }

    let tableDescendantHighlightObserver = null;

function ensureTableDescendantHighlightWatcher() {
  const host = document.getElementById("tree");
  if (!host || tableDescendantHighlightObserver) return;

  tableDescendantHighlightObserver = new MutationObserver(() => {
    requestAnimationFrame(() => {
      updateTableDescendantRowHighlights();
    });
  });

  tableDescendantHighlightObserver.observe(host, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  host.addEventListener("click", () => {
    requestAnimationFrame(() => {
      updateTableDescendantRowHighlights();
    });
  }, true);

  host.addEventListener("keyup", () => {
    requestAnimationFrame(() => {
      updateTableDescendantRowHighlights();
    });
  }, true);
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
          syncTableDateTimeLinkedControlsForKey(node, key);
        });
      }
    }

    /* =========================================================
   TABLE UPLOAD CELLS
   Ячейки таблицы, в которые можно загружать файлы.

   Используется для:
   - Обложка
   - Доп изображение
   - Файл
========================================================= */

function markTableUploadCell(td, type) {
  if (!td) return td;

  td.classList.add("table-upload-cell");

  if (type) {
    td.classList.add(`table-upload-cell-${type}`);
  }

  return td;
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

function makeTableCoverCell(node) {
  const td = document.createElement("td");
td.className = "table-cover-cell";
td.dataset.id = node.id;
td.dataset.prop = "cover";

markTableUploadCell(td, "cover");

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

/* ======================= /TABLE UPLOAD CELLS ======================= */

    

    

    function getTableColumnByKey(key) {
      if (key === TABLE_ICON_COLUMN.key) {
        return TABLE_ICON_COLUMN;
      }
    
      return getAllTablePropertyColumns().find((column) => column.key === key) || null;
    }
    
    function isDirectEditableTableColumn(column) {
      if (!column) return false;
    
      return (
        column.key === "startDate" ||
        column.key === "startTime" ||
        column.key === "endDate" ||
        column.key === "endTime"
      );
    }
    
    function getDirectTableCellValueText(node, column) {
      const value = getTableProp(node, column.key);
    
      if (column.key === "icon") {
        return getTableIconSymbol(value);
      }
    
      if (column.inputType === "select") {
        return getTableSelectLabel(node, column);
      }
    
      if (column.inputType === "date") {
        return formatTableDateCompact(value);
      }
    
      if (column.inputType === "time") {
        return formatTableTimeCompact(value);
      }
    
      return String(value || "");
    }
    
    function renderDirectTableCellView(td, node, column) {
      td.innerHTML = "";
    
      const value = getDirectTableCellValueText(node, column);
    
      const view = document.createElement("div");
      view.className = "table-cell-value";
    
      if (value) {
        view.textContent = value;
      } else {
        view.classList.add("is-empty");
        view.textContent = "";
      }
    
      td.appendChild(view);
    }
    
    function makeDirectTablePropCell(node, column) {
      const td = document.createElement("td");
    
      td.className = "table-prop-cell table-direct-cell";
      td.dataset.prop = column.key;
      td.dataset.id = node.id;
      td.dataset.editorType = column.inputType || "text";
    
      renderDirectTableCellView(td, node, column);
    
      td.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        window.tableCellNav?.selectCell?.(td, {
          focus: true,
          scroll: false,
        });
    
        startDirectTableCellEdit(td);
      });
    
      return td;
    }
    
    function startDirectTableCellEdit(td) {
      if (!td || !td.classList.contains("table-direct-cell")) return false;
      if (td.classList.contains("is-editing")) return true;
    
      const id = td.dataset.id || td.dataset.rowId;
      const key = td.dataset.prop;
    
      if (!id || !key) return false;
    
      const found = findWithParent(root, id);
      const node = found?.node;
      const column = getTableColumnByKey(key);
    
      if (!node || !column || !isDirectEditableTableColumn(column)) {
        return false;
      }
    
      const oldValue = getTableProp(node, column.key);
    
      td.classList.add("is-editing");
      td.innerHTML = "";
    
      const editor = document.createElement("input");
      editor.className = "table-cell-editor table-cell-input-editor";
      editor.type = column.inputType || "text";
      editor.value = oldValue || "";
    
      let finished = false;
    
      function finish(save, options = {}) {
        if (finished) return;
      
        const mode = options.mode || "blur";
      
        if (save) {
          const nextValue = String(editor.value || "").trim();
      
          if (!isValidDirectDateTimeValue(column, nextValue)) {
            editor.classList.add("is-invalid");
            td.classList.add("is-invalid");
      
            // Если пользователь нажал Enter на неполном значении —
            // оставляем редактор открытым, чтобы можно было дописать.
            if (mode === "enter") {
              requestAnimationFrame(() => {
                editor.focus({ preventScroll: true });
              });
      
              return;
            }
      
            // Если ячейка потеряла фокус с битым значением —
            // ничего не сохраняем, возвращаем старое значение.
            save = false;
          }
        }
      
        finished = true;
      
        if (save) {
          setTableProp(node, column.key, String(editor.value || "").trim());
        }
      
        td.classList.remove("is-editing", "is-invalid");
        renderDirectTableCellView(td, node, column);
      
        requestAnimationFrame(() => {
          window.tableCellNav?.selectCell?.(td, {
            focus: true,
            scroll: false,
          });
        });
      }
    
      editor.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    
      editor.addEventListener("dblclick", (e) => {
        e.stopPropagation();
      });
    
      editor.addEventListener("keydown", (e) => {
        e.stopPropagation();
    
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
          finish(true, {
            mode: "enter",
          });
          return;
        }
    
        if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
          return;
        }
      });
    
      editor.addEventListener("input", () => {
        editor.classList.remove("is-invalid");
        td.classList.remove("is-invalid");
      });
      
      editor.addEventListener("change", () => {
        editor.classList.remove("is-invalid");
        td.classList.remove("is-invalid");
      
        // Для даты и времени ничего не сохраняем на change.
        // Сохраняем только на Enter или blur, и только если значение валидное.
      });
    
      editor.addEventListener("blur", () => {
        finish(true, {
          mode: "blur",
        });
      });
    
      td.appendChild(editor);
    
      requestAnimationFrame(() => {
        editor.focus({ preventScroll: true });
    
        if (
          editor instanceof HTMLInputElement &&
          editor.type !== "date" &&
          editor.type !== "time"
        ) {
          editor.select?.();
        }
      });
    
      return true;
    }

    function startTableCompositeDateTimeCellFromTd(td) {
      const control = td?.querySelector?.(".table-composite-datetime-control");
    
      if (!control?.openEditor) {
        return false;
      }
    
      control.openEditor();
    
      return true;
    }
    
    window.tableCellEditors = {
      startEdit(td) {
        if (startBuiltinTableCellEdit(td)) {
          return true;
        }
    
        if (startTableRichTextCellFromTd(td)) {
          return true;
        }
    
        if (startTableCompositeDateTimeCellFromTd(td)) {
          return true;
        }
    
        return startDirectTableCellEdit(td);
      },
    };
    
    /* =========================================================
       TABLE RICH TEXT CELLS
       Общий rich-редактор для текстовых ячеек таблицы.
    
       Используется для:
       - Описание
       - Текст
    ========================================================= */
    
    function escapeTableRichText(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
    
    function plainTextFromRichHtml(html) {
      if (typeof htmlPlainText === "function") {
        return htmlPlainText(html);
      }
    
      const tmp = document.createElement("div");
      tmp.innerHTML = html || "";
      return (tmp.textContent || "").trim();
    }
    
    function normalizeTableRichHtml(html) {
      if (window.__fmtSync?.normalizeRichHtml) {
        const next = window.__fmtSync.normalizeRichHtml(html || "");
    
        return {
          html: next.html || "",
          text: next.text || "",
        };
      }
    
      const tmp = document.createElement("div");
      tmp.innerHTML = html || "";
    
      function replaceTag(selector, cls) {
        tmp.querySelectorAll(selector).forEach((el) => {
          const span = document.createElement("span");
          span.className = cls;
          span.innerHTML = el.innerHTML;
          el.replaceWith(span);
        });
      }
    
      replaceTag("b,strong", "rt-b");
      replaceTag("i,em", "rt-i");
      replaceTag("u", "rt-u");
      replaceTag("s,strike,del", "rt-s");
    
      function walk(node) {
        for (const child of Array.from(node.childNodes)) {
          if (child.nodeType !== Node.ELEMENT_NODE) continue;
    
          const tag = child.tagName.toLowerCase();
    
          if (tag === "br") {
            continue;
          }
    
          if (tag === "div") {
            child.before(...Array.from(child.childNodes), document.createElement("br"));
            child.remove();
            continue;
          }
    
          if (tag === "span") {
            const keep =
              child.classList.contains("rt-b") ||
              child.classList.contains("rt-i") ||
              child.classList.contains("rt-u") ||
              child.classList.contains("rt-s") ||
              child.classList.contains("rt-color") ||
              child.classList.contains("rt-bg");
    
            if (!keep) {
              child.replaceWith(...Array.from(child.childNodes));
              continue;
            }
    
            const styleParts = [];
    
            if (child.classList.contains("rt-color")) {
              const color = child.style.getPropertyValue("--rt-color") || "";
    
              if (color) {
                styleParts.push(`--rt-color:${color}`);
              }
            }
    
            if (child.classList.contains("rt-bg")) {
              const bg = child.style.getPropertyValue("--rt-bg") || "";
    
              if (bg) {
                styleParts.push(`--rt-bg:${bg}`);
              }
            }
    
            if (styleParts.length) {
              child.setAttribute("style", styleParts.join(";"));
            } else {
              child.removeAttribute("style");
            }
    
            walk(child);
            continue;
          }
    
          child.replaceWith(...Array.from(child.childNodes));
        }
      }
    
      walk(tmp);
    
      while (tmp.lastChild && tmp.lastChild.nodeName === "BR") {
        tmp.removeChild(tmp.lastChild);
      }
    
      const hasFmt = !!tmp.querySelector(
        "span.rt-b, span.rt-i, span.rt-u, span.rt-s, span.rt-color, span.rt-bg"
      );
    
      return {
        html: hasFmt ? tmp.innerHTML : "",
        text: (tmp.textContent || "").trim(),
      };
    }
    
    function renderTableRichCellValue(td, rich) {
      td.innerHTML = "";
    
      const view = document.createElement("div");
      view.className = "table-cell-value table-rich-cell-value";
    
      const html = rich?.html || "";
      const text = rich?.text || "";
    
      if (html) {
        view.innerHTML = html;
      } else if (text) {
        view.textContent = text;
      } else {
        view.classList.add("is-empty");
        view.textContent = "";
      }
    
      td.appendChild(view);
    }
    
    function getTableDescriptionRich(node) {
      if (!Array.isArray(node.captions) || !node.captions.length) {
        return {
          text: "",
          html: "",
        };
      }
    
      const parts = node.captions
        .map((caption) => {
          const html = caption.textHtml || "";
          const text = caption.text || plainTextFromRichHtml(html);
    
          return {
            text,
            html,
          };
        })
        .filter((part) => part.text || part.html);
    
      if (!parts.length) {
        return {
          text: "",
          html: "",
        };
      }
    
      if (parts.length === 1) {
        return parts[0];
      }
    
      const hasHtml = parts.some((part) => part.html);
    
      return {
        text: parts.map((part) => part.text).join("\n"),
        html: hasHtml
          ? parts
              .map((part) => part.html || escapeTableRichText(part.text))
              .join("<br>")
          : "",
      };
    }
    
    function setTableDescriptionRich(node, rich) {
      const nextText = String(rich?.text || "");
      const nextHtml = String(rich?.html || "");
    
      const old = getTableDescriptionRich(node);
    
      if (old.text === nextText && old.html === nextHtml) {
        return;
      }
    
      if (typeof pushHistory === "function") {
        pushHistory();
      }
    
      if (!nextText.trim() && !nextHtml.trim()) {
        node.captions = [];
        return;
      }
    
      const first = Array.isArray(node.captions) ? node.captions[0] : null;
    
      node.captions = [
        {
          id: first?.id || uid(),
          text: nextText,
          textHtml: nextHtml,
        },
      ];
    }
    
    function getTablePropRich(node, key) {
      const text = String(getTableProp(node, key) || "");
      const html = String(getTableProp(node, `${key}Html`) || "");
    
      return {
        text,
        html,
      };
    }
    
    function setTablePropRich(node, key, rich) {
      const props = ensureTableProps(node);
    
      const nextText = String(rich?.text || "");
      const nextHtml = String(rich?.html || "");
    
      const oldText = String(props[key] || "");
      const oldHtml = String(props[`${key}Html`] || "");
    
      if (oldText === nextText && oldHtml === nextHtml) {
        return;
      }
    
      if (typeof pushHistory === "function" && typeof snapshot === "function") {
        pushHistory(snapshot());
      } else if (typeof pushHistory === "function") {
        pushHistory();
      }
    
      props[key] = nextText;
      props[`${key}Html`] = nextHtml;
    }
    
    function renderTablePlainCellValue(td, value) {
      td.innerHTML = "";
    
      const view = document.createElement("div");
      view.className = "table-cell-value";
    
      if (value) {
        view.textContent = value;
      } else {
        view.classList.add("is-empty");
        view.textContent = "";
      }
    
      td.appendChild(view);
    }
    
    function renderTableIdCell(td, node) {
      renderTablePlainCellValue(td, node.id || "");
    }
    
    function renderTableOrdinalCell(td, node, ordinalPath) {
      const isFocusedRoot =
        window.objectFocus?.getFocusedRootId?.() === node.id;
    
      const ordinal = isFocusedRoot
        ? ""
        : (ordinalPath.length ? ordinalPath.join(".") : "0");
    
      td.dataset.defaultOrdinal = ordinal;
    
      renderTablePlainCellValue(td, ordinal);
    }
    
    function renderTableDescriptionCell(td, node) {
      renderTableRichCellValue(td, getTableDescriptionRich(node));
    }
    
    function renderTableTextPropCell(td, node, column) {
      renderTableRichCellValue(td, getTablePropRich(node, column.key));
    }
    
    function startTableRichTextCellEditor(td, options) {
      if (!td) return false;
      if (td.classList.contains("is-editing")) return true;
    
      const {
        value = {
          text: "",
          html: "",
        },
        multiline = false,
        save,
        render,
      } = options || {};
    
      td.classList.add("is-editing", "table-rich-cell-editing");
      td.innerHTML = "";
    
      const editor = document.createElement("div");
      editor.className = multiline
        ? "edit edit-rich edit-caption table-rich-cell-editor table-rich-cell-editor-multiline"
        : "edit edit-rich table-rich-cell-editor";
    
      editor.contentEditable = "true";
      editor.spellcheck = false;
    
      if (value.html) {
        editor.innerHTML = value.html;
      } else {
        editor.textContent = value.text || "";
      }
    
      const stopMouse = (e) => {
        e.stopPropagation();
      };
    
      [
        "pointerdown",
        "pointerup",
        "mousedown",
        "mouseup",
        "click",
        "dblclick",
      ].forEach((eventName) => {
        editor.addEventListener(eventName, stopMouse);
      });
    
      let done = false;
    
      function syncFormattingButtons() {
        if (typeof window.syncFmtButtons === "function") {
          window.syncFmtButtons();
        }
    
        window.colorFormatting?.syncToolbar?.();
      }
    
      function finish(shouldSave) {
        if (done) return;
        done = true;
    
        if (shouldSave && typeof save === "function") {
          const normalized = normalizeTableRichHtml(editor.innerHTML);
    
          const editorText = editor.textContent ?? "";
          const nextText = editorText === "" ? "" : (normalized.text || "");
    
          save({
            text: nextText,
            html: normalized.html || "",
          });
        }
    
        td.classList.remove("is-editing", "table-rich-cell-editing");
    
        if (typeof render === "function") {
          render();
        }
    
        requestAnimationFrame(() => {
          window.tableCellNav?.selectCell?.(td, {
            focus: true,
            scroll: false,
          });
        });
      }
    
      editor.addEventListener("keydown", (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
    
        if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
          return;
        }
    
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          finish(true);
          return;
        }
    
        // Shift + Enter оставляем для переноса строки.
      }, true);
    
      editor.addEventListener("keyup", syncFormattingButtons);
      editor.addEventListener("mouseup", syncFormattingButtons);
      editor.addEventListener("input", syncFormattingButtons);
      editor.addEventListener("blur", () => {
        finish(true);
      });
    
      td.appendChild(editor);
    
      requestAnimationFrame(() => {
        editor.focus({
          preventScroll: true,
        });
    
        const selection = window.getSelection();
        const range = document.createRange();
    
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
    
        syncFormattingButtons();
      });
    
      return true;
    }
    
    function startTableRichTextCellFromTd(td) {
      if (!td) return false;
    
      const id = td.dataset.id || td.dataset.rowId;
      const key = td.dataset.prop;
    
      if (!id || !key) return false;
      if (key !== "text") return false;
    
      const found = findWithParent(root, id);
      const node = found?.node;
      const column = getTableColumnByKey(key);
    
      if (!node || !column) return false;
    
      selectedId = node.id;
      treeHasFocus = true;
    
      return startTableRichTextCellEditor(td, {
        value: getTablePropRich(node, column.key),
        multiline: true,
    
        save(rich) {
          setTablePropRich(node, column.key, rich);
        },
    
        render() {
          renderTableTextPropCell(td, node, column);
        },
      });
    }
    
    function makeTableRichTextPropCell(node, column) {
      const td = document.createElement("td");
    
      td.className = "table-prop-cell table-rich-text-cell table-text-cell";
      td.dataset.prop = column.key;
      td.dataset.id = node.id;
      td.dataset.editorType = "richText";
    
      renderTableTextPropCell(td, node, column);
    
      td.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
    
        window.tableCellNav?.selectCell?.(td, {
          focus: true,
          scroll: false,
        });
    
        startTableRichTextCellFromTd(td);
      });
    
      return td;
    }
    
    /* ======================= /TABLE RICH TEXT CELLS ======================= */
    
    function toggleTableMarkFromCell(td) {
      const id = td.dataset.id || td.dataset.rowId;
      if (!id) return false;
    
      selectedId = id;
      treeHasFocus = true;
    
      window.markProperty?.toggleMarked?.(id);
    
      if (typeof render === "function") {
        render();
      }
    
      return true;
    }
    
    function startBuiltinTableCellEdit(td) {
      if (!td) return false;
    
      const key = td.dataset.cellKey;
      const id = td.dataset.id || td.dataset.rowId;
    
      if (!key || !id) return false;
    
      const found = findWithParent(root, id);
      const node = found?.node;
    
      if (!node) return false;
    
      selectedId = node.id;
      treeHasFocus = true;
    
      if (key === "__mark") {
        return toggleTableMarkFromCell(td);
      }
    
      if (key === "__id" || key === "__ordinal") {
        // ID и нумерация — системные read-only ячейки.
        // Enter/F2 по ним ничего не открывает, но событие считается обработанным,
        // чтобы не срабатывали старые fallback-механики.
        return true;
      }
    
      if (key === "__notes") {
        return startTableRichTextCellEditor(td, {
          value: getTableDescriptionRich(node),
          multiline: true,
      
          save(rich) {
            setTableDescriptionRich(node, rich);
          },
      
          render() {
            renderTableDescriptionCell(td, node);
          },
        });
      }
    
      return false;
    }
    
    function makeTablePropCell(node, column) {
      const td = document.createElement("td");
      td.className = "table-prop-cell";
      td.dataset.prop = column.key;
      td.dataset.id = node.id;
    
      if (column.key === "text") {
        return makeTableRichTextPropCell(node, column);
      }
    
      if (isDirectEditableTableColumn(column)) {
        return makeDirectTablePropCell(node, column);
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

      if (column.inputType === "dateTimePair") {
        td.classList.add("table-datetime-cell");
        td.appendChild(makeTableDateTimeControl(node, column));
        return td;
      }

      if (column.inputType === "dateTimeRangePair") {
        td.classList.add("table-full-datetime-range-cell");
        td.appendChild(makeTableFullDateTimeRangeControl(node, column));
        return td;
      }

      if (column.key === "icon") {
        td.classList.add("table-icon-cell", "table-dropdown-cell");
        td.appendChild(makeTableIconControl(node, column));
        return td;
      }

      if (column.key === "tag") {
        td.classList.add("table-tag-compact-cell", "table-dropdown-cell");
        td.appendChild(makeTableTagCompactControl(node, column));
        return td;
      }

      if (
        column.key === "priority" ||
        column.key === "focus" ||
        column.key === "status"
      ) {
        td.classList.add("table-compact-select-cell", "table-dropdown-cell");
        td.appendChild(makeTableCompactSelectControl(node, column));
        return td;
      }
    
      if (column.inputType === "select") {
        td.classList.add("table-compact-select-cell", "table-dropdown-cell");
        td.appendChild(makeTableCompactSelectControl(node, column));
        return td;
      }
    
      if (column.inputType === "image") {
        td.classList.add("table-extra-image-cell");
        markTableUploadCell(td, "image");
      
        td.appendChild(makeTableImageControl(node, column.key));
        return td;
      }

      if (column.inputType === "file") {
        td.classList.add("table-file-cell");
        markTableUploadCell(td, "file");
      
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

    /* =========================================================
   TABLE DROPDOWN CELLS
   Общий dropdown-редактор для select-ячеек таблицы.

   Используется для:
   - Тег
   - Иконка
   - Приоритет
   - Фокус
   - Статус

   Визуально использует те же классы, что и идеальная ячейка Тег:
   .table-tag-compact-control
   .table-tag-compact-view
   .table-tag-compact-trigger
   .table-tag-compact-menu
   .table-tag-compact-option
========================================================= */

function getTableSelectOptions(node, column) {
  const currentValue = getTableProp(node, column.key);

  const rawOptions =
    typeof column.options === "function"
      ? column.options(node)
      : (column.options || []);

  const options = rawOptions.map((option) => ({
    value: String(option.value ?? ""),
    label: String(option.label ?? option.value ?? ""),
  }));

  if (
    currentValue &&
    !options.some((option) => option.value === currentValue)
  ) {
    const addIndex = options.findIndex(
      (option) => option.value === TABLE_TAG_ADD_VALUE
    );

    const currentOption = {
      value: currentValue,
      label: currentValue,
    };

    if (addIndex >= 0) {
      options.splice(addIndex, 0, currentOption);
    } else {
      options.push(currentOption);
    }
  }

  return options;
}

function getTableSelectOptionLabel(node, column, value) {
  const strValue = String(value ?? "");

  const found = getTableSelectOptions(node, column).find(
    (option) => option.value === strValue
  );

  return found ? found.label : strValue;
}

function makeTableDropdownControl(node, column, config = {}) {
  const wrap = document.createElement("div");
  wrap.className = [
    "table-tag-compact-control",
    "table-dropdown-cell-control",
    config.controlClass || "",
  ].filter(Boolean).join(" ");

  const view = document.createElement("div");
  view.className = [
    "table-tag-compact-view",
    config.viewClass || "",
  ].filter(Boolean).join(" ");

  view.title = column.title || "";

  const editor = document.createElement("div");
  editor.className = [
    "table-tag-compact-editor",
    config.editorClass || "",
  ].filter(Boolean).join(" ");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = [
    "table-tag-compact-trigger",
    config.triggerClass || "",
  ].filter(Boolean).join(" ");

  const menu = document.createElement("div");
  menu.className = [
    "table-tag-compact-menu",
    config.menuClass || "",
  ].filter(Boolean).join(" ");

  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  let isMenuOpen = false;

  function isDropdownActivateHotkey(e) {
  return !!window.tableCellNav?.isCellActivateHotkey?.(e);
}

function isNativeDropdownActionKey(e) {
  return (
    e.key === "Enter" ||
    e.code === "NumpadEnter" ||
    e.key === " " ||
    e.code === "Space"
  );
}

function stopDropdownActionKey(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();
}

  function getCellFocusableElements() {
    const cell = wrap.closest("td") || wrap;
  
    return Array.from(
      cell.querySelectorAll(
        [
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",")
      )
    ).filter((el) => {
      if (!el) return false;
      if (el.hidden) return false;
      if (el.closest("[hidden]")) return false;
  
      const style = window.getComputedStyle(el);
  
      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  }
  
  function trapTabInsideCell(e) {
    if (e.key !== "Tab") return;
  
    const items = getCellFocusableElements();
  
    if (!items.length) {
      e.preventDefault();
      return;
    }
  
    if (items.length === 1) {
      e.preventDefault();
  
      items[0].focus({
        preventScroll: true,
      });
  
      return;
    }
  
    const active = document.activeElement;
    let index = items.indexOf(active);
  
    if (index < 0) {
      index = 0;
    }
  
    const nextIndex = e.shiftKey
      ? (index - 1 + items.length) % items.length
      : (index + 1) % items.length;
  
    e.preventDefault();
  
    items[nextIndex].focus({
      preventScroll: true,
    });
  }

  function getCurrentValue() {
    return getTableProp(node, column.key) || "";
  }

  function getOptions() {
    return getTableSelectOptions(node, column);
  }

  function getLabel(value) {
    return getTableSelectOptionLabel(node, column, value);
  }

  function getViewText(value) {
    if (typeof config.formatView === "function") {
      return String(config.formatView(value, node, column) || "");
    }

    if (!value) return "";

    return getLabel(value);
  }

  function getTriggerText(value) {
    if (typeof config.formatTrigger === "function") {
      return String(config.formatTrigger(value, node, column) || "");
    }

    return getLabel(value) || config.emptyLabel || "нет";
  }

  function syncView() {
    const value = getCurrentValue();

    const viewText = getViewText(value);
    const triggerText = getTriggerText(value);

    view.textContent = viewText;
    view.classList.toggle("is-empty", !viewText);

    trigger.textContent = triggerText;
  }

  function restoreCellFocus() {
    requestAnimationFrame(() => {
      const td = wrap.closest("td");

      if (!td || !document.body.contains(td)) return;

      window.tableCellNav?.selectCell?.(td, {
        focus: true,
        scroll: false,
      });
    });
  }

  function focusMenuOption(delta = 0) {
    const options = Array.from(
      menu.querySelectorAll(".table-tag-compact-option")
    );

    if (!options.length) return;

    const active = document.activeElement;
    let index = options.indexOf(active);

    if (index < 0) {
      const currentValue = getCurrentValue();

      index = options.findIndex(
        (button) => button.dataset.value === currentValue
      );
    }

    if (index < 0) index = 0;

    const nextIndex = Math.max(
      0,
      Math.min(options.length - 1, index + delta)
    );

    options[nextIndex].focus({
      preventScroll: true,
    });
  }

  function closeMenu() {
    isMenuOpen = false;
    menu.hidden = true;
    wrap.classList.remove("is-menu-open");
  }

  function closeEditor(options = {}) {
    closeMenu();

    wrap.classList.remove("is-editing");
    syncView();

    if (options.restoreFocus !== false) {
      restoreCellFocus();
    }
  }

  function commitValue(value) {
    if (typeof config.beforeCommit === "function") {
      const result = config.beforeCommit(value, {
        node,
        column,
        closeEditor,
      });

      if (result === false) {
        return;
      }

      if (typeof result === "string") {
        value = result;
      }
    }

    const oldValue = getCurrentValue();

    if (oldValue !== value) {
      setTableProp(node, column.key, value);
    }

    closeEditor();
  }

  function fillMenu() {
    menu.innerHTML = "";

    const currentValue = getCurrentValue();
    const options = getOptions();

    options.forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "table-tag-compact-option";
      btn.dataset.value = option.value;
      btn.textContent = option.label;
      btn.setAttribute("role", "option");

      if (option.value === currentValue) {
        btn.classList.add("is-current");
        btn.setAttribute("aria-selected", "true");
      }

      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        commitValue(option.value);
      });

      btn.addEventListener("keydown", (e) => {
        e.stopPropagation();

        if (e.key === "Escape") {
          e.preventDefault();
          closeEditor();
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          focusMenuOption(1);
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          focusMenuOption(-1);
          return;
        }

if (isNativeDropdownActionKey(e) && !isDropdownActivateHotkey(e)) {
  stopDropdownActionKey(e);
  return;
}

if (isDropdownActivateHotkey(e)) {
  stopDropdownActionKey(e);
  commitValue(option.value);
}
      });

      menu.appendChild(btn);
    });

    if (typeof config.renderActions === "function") {
      const actions = config.renderActions({
        node,
        column,
        value: currentValue,
        closeEditor,
        restoreCellFocus,
      });

      if (actions) {
        menu.appendChild(actions);
      }
    }
  }

  function openMenu() {
    fillMenu();

    isMenuOpen = true;
    menu.hidden = false;
    wrap.classList.add("is-menu-open");

    requestAnimationFrame(() => {
      focusMenuOption(0);
    });
  }

  function openEditor(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    selectedId = node.id;
    treeHasFocus = true;

    closeMenu();
    syncView();

    wrap.classList.add("is-editing");

    // Первый Enter / F2 только показывает компактный trigger.
    // Второй Enter уже раскрывает список.
    requestAnimationFrame(() => {
      trigger.focus({
        preventScroll: true,
      });
    });
  }

  wrap.openEditor = openEditor;

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  trigger.addEventListener("keydown", (e) => {
    e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      closeEditor();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
      return;
    }

if (isNativeDropdownActionKey(e) && !isDropdownActivateHotkey(e)) {
  stopDropdownActionKey(e);
  return;
}

if (isDropdownActivateHotkey(e)) {
  stopDropdownActionKey(e);

  if (!isMenuOpen) {
    openMenu();
    return;
  }

  focusMenuOption(0);
}
  });

  editor.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  wrap.addEventListener("keydown", trapTabInsideCell, true);

  wrap.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!wrap.contains(document.activeElement)) {
        closeEditor({
          restoreFocus: false,
        });
      }
    }, 0);
  });

  syncView();

  editor.appendChild(trigger);
  editor.appendChild(menu);

  wrap.appendChild(view);
  wrap.appendChild(editor);

  return wrap;
}

function makeTableTagActions({ value, closeEditor }) {
  if (!isRealTableTag(value)) return null;

  const actions = document.createElement("div");
  actions.className = "table-tag-compact-actions";

  const renameBtn = document.createElement("button");
  renameBtn.type = "button";
  renameBtn.className = "table-tag-compact-action";
  renameBtn.textContent = "переименовать";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "table-tag-compact-action";
  deleteBtn.textContent = "удалить";

  renameBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  deleteBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  renameBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (renameTableTagOption(value)) {
      closeEditor({
        restoreFocus: false,
      });
    }
  });

  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (deleteTableTagOption(value)) {
      closeEditor({
        restoreFocus: false,
      });
    }
  });

[renameBtn, deleteBtn].forEach((btn) => {
  btn.addEventListener("keydown", (e) => {
    e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      closeEditor();
      return;
    }

    const isNativeActionKey =
      e.key === "Enter" ||
      e.code === "NumpadEnter" ||
      e.key === " " ||
      e.code === "Space";

    const isActivateHotkey =
      !!window.tableCellNav?.isCellActivateHotkey?.(e);

    if (isNativeActionKey && !isActivateHotkey) {
      e.preventDefault();
      e.stopImmediatePropagation?.();
      return;
    }

    if (isActivateHotkey) {
      e.preventDefault();
      e.stopImmediatePropagation?.();
      btn.click();
    }
  });
});

  actions.appendChild(renameBtn);
  actions.appendChild(deleteBtn);

  return actions;
}

function makeTableIconControl(node, column) {
  return makeTableDropdownControl(node, column, {
    controlClass: "table-icon-dropdown-control",

    emptyLabel: "сбросить",

    formatView(value) {
      return getTableIconSymbol(value);
    },

    formatTrigger(value) {
      return getTableSelectOptionLabel(node, column, value) || "сбросить";
    },
  });
}

    function makeTableTagCompactControl(node, column) {
      return makeTableDropdownControl(node, column, {
        controlClass: "table-tag-dropdown-control",
    
        emptyLabel: "нет",
    
        formatView(value) {
          return value || "";
        },
    
        formatTrigger(value) {
          return getTableSelectOptionLabel(node, column, value) || "нет";
        },
    
        beforeCommit(value) {
          if (value !== TABLE_TAG_ADD_VALUE) {
            return value;
          }
    
          const newTag = window.prompt("Новый тег", "");
    
          if (!newTag || !newTag.trim()) {
            return false;
          }
    
          return addTableTagOption(newTag);
        },
    
        renderActions({ value, closeEditor }) {
          return makeTableTagActions({
            value,
            closeEditor,
          });
        },
      });
    }

    function makeTableCompactSelectControl(node, column) {
      return makeTableDropdownControl(node, column, {
        controlClass: "table-simple-dropdown-control",
    
        emptyLabel: "нет",
    
        formatView(value) {
          if (!value) return "";
          return getTableSelectOptionLabel(node, column, value);
        },
    
        formatTrigger(value) {
          return getTableSelectOptionLabel(node, column, value) || "нет";
        },
      });
    }

    /* ======================= /TABLE DROPDOWN CELLS ======================= */

    
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

    function getSelectedTableCell() {
  const host = document.getElementById("tree");
  if (!host) return null;

  return host.querySelector("td.table-cell-selected");
}

function isVisibleFocusableElement(el) {
  if (!el) return false;
  if (el.disabled) return false;
  if (el.hidden) return false;
  if (el.closest("[hidden]")) return false;

  const style = window.getComputedStyle(el);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.getClientRects().length > 0
  );
}

function getFocusableElementsInsideTableCell(td) {
  if (!td) return [];

  return Array.from(
    td.querySelectorAll(
      [
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",")
    )
  ).filter(isVisibleFocusableElement);
}

function focusInsideSelectedTableCell(td, reverse = false) {
  if (!td) return false;

  const items = getFocusableElementsInsideTableCell(td);

  if (!items.length) return false;

  const active = document.activeElement;
  const currentIndex = items.indexOf(active);

  let nextIndex;

  if (currentIndex < 0) {
    nextIndex = reverse ? items.length - 1 : 0;
  } else {
    nextIndex = reverse
      ? (currentIndex - 1 + items.length) % items.length
      : (currentIndex + 1) % items.length;
  }

  items[nextIndex].focus({
    preventScroll: true,
  });

  return true;
}

function handleTableCellTabNavigation(e) {
  if (e.key !== "Tab") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const host = document.getElementById("tree");
  if (!host || !host.querySelector(".structure-table")) return;

  const active = document.activeElement;

  // Если фокус сейчас на кнопках вне таблицы — не мешаем обычному Tab.
  if (active && active !== document.body && !host.contains(active)) {
    return;
  }

  const selectedCell = getSelectedTableCell();
  if (!selectedCell) return;

  e.preventDefault();
  e.stopPropagation();

  if (focusInsideSelectedTableCell(selectedCell, e.shiftKey)) {
    return;
  }

  // Если в ячейке пока нет фокусируемых элементов,
  // пробуем открыть её редактор.
  const opened = window.tableCellEditors?.startEdit?.(selectedCell);

  if (!opened) return;

  requestAnimationFrame(() => {
    const freshSelectedCell = getSelectedTableCell() || selectedCell;
    focusInsideSelectedTableCell(freshSelectedCell, e.shiftKey);
  });
}

function ensureTableCellTabNavigation() {
  if (document.__tableCellTabNavigationBound) return;

  document.__tableCellTabNavigationBound = true;

  document.addEventListener("keydown", handleTableCellTabNavigation, true);
}

  
    function renderTableRow(node, ordinalPath) {
      const tr = document.createElement("tr");
      tr.className = node.id === selectedId ? "is-selected" : "";
  
      const idTd = document.createElement("td");
        idTd.className = "table-id-cell table-builtin-cell";
        idTd.dataset.id = node.id;
        idTd.dataset.cellKey = "__id";
        renderTableIdCell(idTd, node);

        const markTd = document.createElement("td");
        markTd.className = "table-mark-cell";
        markTd.dataset.id = node.id;
        markTd.dataset.cellKey = "__mark";

        if (window.markProperty?.buildMarkDot) {
          markTd.appendChild(window.markProperty.buildMarkDot(node.id));
        }

        const ordTd = document.createElement("td");
        ordTd.className = "table-ordinal-cell table-builtin-cell";
        ordTd.dataset.id = node.id;
        ordTd.dataset.cellKey = "__ordinal";
        renderTableOrdinalCell(ordTd, node, ordinalPath);

                const iconTd = makeTablePropCell(node, TABLE_ICON_COLUMN);
        iconTd.classList.add("table-icon-cell");

        const coverTd = makeTableCoverCell(node);
  
      const levelTd = document.createElement("td");
      levelTd.textContent = DEFAULT_NAME[node.level] || `Уровень ${node.level}`;
  
      const nameTd = document.createElement("td");
      nameTd.className = "table-name-cell table-name-row row";
      nameTd.dataset.id = node.id;
      nameTd.dataset.cellKey = "__name";

      const label = document.createElement("span");
      label.className = "label table-name-cell-label";

      if (node.nameHtml) {
        label.innerHTML = node.nameHtml;
      } else {
        label.textContent = node.name || "";
      }

      nameTd.appendChild(label);

      const act = document.createElement("span");
      act.className = "act table-name-cell-actions";

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

nameTd.appendChild(act);
  
      const notesTd = document.createElement("td");
notesTd.className = "table-notes-cell table-builtin-cell";
notesTd.dataset.id = node.id;
notesTd.dataset.cellKey = "__notes";
renderTableDescriptionCell(notesTd, node);
  
      tr.append(idTd, markTd, ordTd, iconTd, coverTd, levelTd, nameTd, notesTd);

      appendTablePropertyCells(tr, node);
  
      return tr;
    }
  })();