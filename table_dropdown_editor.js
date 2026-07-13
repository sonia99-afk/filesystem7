// table_dropdown_editor.js
// Общий dropdown-редактор для ячеек таблицы.
// Используется для: тег, иконка, приоритет, фокус, статус и будущие select-поля.

(function () {
    if (typeof window === "undefined") return;
  
    function normalizeOptions(options) {
      return (options || [])
        .filter(Boolean)
        .map((option) => ({
          value: String(option.value ?? ""),
          label: String(option.label ?? option.value ?? ""),
        }));
    }
  
    function getOptionLabel(options, value) {
      const strValue = String(value ?? "");
      const found = options.find((option) => option.value === strValue);
  
      return found ? found.label : strValue;
    }
  
    function makeClass(base, extra) {
      return [base, extra].filter(Boolean).join(" ");
    }
  
    function createDropdownControl(config) {
      const wrap = document.createElement("div");
      wrap.className = makeClass(
        "table-dropdown-control",
        config.controlClass
      );
  
      const view = document.createElement("div");
      view.className = makeClass(
        "table-dropdown-view",
        config.viewClass
      );
  
      const editor = document.createElement("div");
      editor.className = makeClass(
        "table-dropdown-editor",
        config.editorClass
      );
  
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = makeClass(
        "table-dropdown-trigger",
        config.triggerClass
      );
  
      const menu = document.createElement("div");
      menu.className = makeClass(
        "table-dropdown-menu",
        config.menuClass
      );
      menu.setAttribute("role", "listbox");
      menu.hidden = true;
  
      let isMenuOpen = false;
  
      function getValue() {
        return String(config.getValue?.() ?? "");
      }
  
      function getOptions() {
        return normalizeOptions(config.getOptions?.() || []);
      }
  
      function formatView(value) {
        if (typeof config.formatView === "function") {
          return String(config.formatView(value) ?? "");
        }
  
        return value;
      }
  
      function formatTrigger(value) {
        if (typeof config.formatTrigger === "function") {
          return String(config.formatTrigger(value, getOptions()) ?? "");
        }
  
        return getOptionLabel(getOptions(), value);
      }
  
      function syncView() {
        const value = getValue();
  
        const viewText = formatView(value);
        const triggerText =
          formatTrigger(value) ||
          config.placeholder ||
          "";
  
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
  
      function focusMenuOption(delta = 0) {
        const options = Array.from(
          menu.querySelectorAll(".table-dropdown-option")
        );
  
        if (!options.length) return;
  
        const active = document.activeElement;
        let index = options.indexOf(active);
  
        if (index < 0) {
          const currentValue = getValue();
  
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
  
      function commitValue(value) {
        const result = config.onCommit?.(String(value ?? ""));
  
        if (result === false) {
          return;
        }
  
        closeEditor();
      }
  
      function fillMenu() {
        menu.innerHTML = "";
  
        const currentValue = getValue();
        const options = getOptions();
  
        options.forEach((option) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = makeClass(
            "table-dropdown-option",
            config.optionClass
          );
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
  
            if (e.key === "Enter" || e.code === "NumpadEnter") {
              e.preventDefault();
              commitValue(option.value);
            }
          });
  
          menu.appendChild(btn);
        });
  
        const actions =
          typeof config.getActions === "function"
            ? config.getActions(currentValue)
            : [];
  
        if (actions && actions.length) {
          const actionsWrap = document.createElement("div");
          actionsWrap.className = makeClass(
            "table-dropdown-actions",
            config.actionsClass
          );
  
          actions.forEach((action) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = makeClass(
              "table-dropdown-action",
              config.actionClass
            );
            btn.textContent = action.text;
  
            btn.addEventListener("mousedown", (e) => {
              e.preventDefault();
            });
  
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
  
              action.onClick?.({
                value: currentValue,
                closeEditor,
                closeMenu,
                restoreCellFocus,
              });
            });
  
            btn.addEventListener("keydown", (e) => {
              e.stopPropagation();
  
              if (e.key === "Escape") {
                e.preventDefault();
                closeEditor();
              }
            });
  
            actionsWrap.appendChild(btn);
          });
  
          menu.appendChild(actionsWrap);
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
  
        config.onOpen?.();
  
        closeMenu();
        syncView();
  
        wrap.classList.add("is-editing");
  
        requestAnimationFrame(() => {
          trigger.focus({
            preventScroll: true,
          });
        });
      }
  
      wrap.openEditor = openEditor;
      wrap.closeEditor = closeEditor;
  
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
  
        if (e.key === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
  
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
  
    window.tableDropdownEditor = {
      create: createDropdownControl,
    };
  })();