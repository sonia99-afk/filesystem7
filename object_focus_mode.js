// object_focus_mode.js
// Погружение в объект: выбранный объект становится временным корнем отображения.
// Пока подключаем к режиму "Структура".

(function () {
    if (typeof window === "undefined") return;
  
    let focusedRootId = null;
  
    function isEditingNow() {
      const ae = document.activeElement;
      if (!ae) return false;
      if (ae.tagName === "INPUT" && ae.classList?.contains("edit")) return true;
      if (ae.tagName === "TEXTAREA" && ae.classList?.contains("tg-export")) return true;
      if (ae.isContentEditable) return true;
      return false;
    }
  
    function plainNodeName(node) {
      if (!node) return "";
  
      if (node.nameHtml) {
        const tmp = document.createElement("div");
        tmp.innerHTML = node.nameHtml;
        return (tmp.textContent || "").trim();
      }
  
      return (node.name || "").trim();
    }
  
    function findPathToNode(targetId) {
      const path = [];
  
      function walk(node) {
        if (!node) return false;
  
        path.push(node);
  
        if (node.id === targetId) return true;
  
        for (const child of node.children || []) {
          if (walk(child)) return true;
        }
  
        path.pop();
        return false;
      }
  
      if (!targetId) return [];
      walk(root);
  
      return path;
    }
  
    function getFocusedRootId() {
      return focusedRootId;
    }
  
    function getFocusedRootNode() {
      if (!focusedRootId) return root;
  
      const found = findWithParent(root, focusedRootId);
      return found?.node || root;
    }
  
    function getFocusedRootOrdinalPath() {
      if (!focusedRootId || focusedRootId === root.id) return [];
  
      const path = findPathToNode(focusedRootId);
      if (!path.length) return [];
  
      const ord = [];
  
      for (let i = 1; i < path.length; i++) {
        const parent = path[i - 1];
        const node = path[i];
  
        const index = (parent.children || []).findIndex((child) => child.id === node.id);
        if (index < 0) return [];
  
        ord.push(index + 1);
      }
  
      return ord;
    }
  
    function focusInto(id) {
      if (!id) return false;
      if (currentView === VIEW.TEXT) return false;
  
      const found = findWithParent(root, id);
      if (!found) return false;
  
      focusedRootId = id;
      selectedId = id;
      treeHasFocus = true;
  
      render();
      renderBreadcrumbs();
  
      return true;
    }
  
    function focusOutTo(id) {
      if (!id) {
        focusedRootId = null;
        selectedId = root.id;
      } else {
        const found = findWithParent(root, id);
        if (!found) return false;
  
        focusedRootId = id === root.id ? null : id;
        selectedId = id;
      }
  
      treeHasFocus = true;
  
      render();
      renderBreadcrumbs();
  
      return true;
    }
  
    function resetFocus() {
      focusedRootId = null;
      render();
      renderBreadcrumbs();
    }
  
    function renderBreadcrumbs() {
      const bar = document.getElementById("objectBreadcrumbs");
      if (!bar) return;
  
      bar.innerHTML = "";
  
      if (!focusedRootId || focusedRootId === root.id) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "object-breadcrumb-item is-current";
        item.textContent = plainNodeName(root) || "Уровень 0";
        item.title = item.textContent;
        bar.appendChild(item);
        return;
      }
  
      const path = findPathToNode(focusedRootId);
  
      path.forEach((node, index) => {
        if (index > 0) {
          const sep = document.createElement("span");
          sep.className = "object-breadcrumb-separator";
          sep.textContent = "›";
          bar.appendChild(sep);
        }
  
        const item = document.createElement("button");
        item.type = "button";
        item.className =
          "object-breadcrumb-item" + (index === path.length - 1 ? " is-current" : "");
  
        item.textContent = plainNodeName(node) || "Путь";
        item.title = item.textContent;
  
        item.addEventListener("click", () => {
          focusOutTo(node.id);
        });
  
        bar.appendChild(item);
      });
    }
  
    window.addEventListener(
      "keydown",
      (e) => {
        if (window.hotkeysMode === "custom") return;
        if (isEditingNow()) return;
        if (currentView === VIEW.TEXT) return;
        if (typeof isTreeLocked === "function" && isTreeLocked()) return;
  
        if (
            e.shiftKey &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            e.code === "KeyO"
          ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
  
          if (!selectedId) return;
  
          focusInto(selectedId);
        }
      },
      true
    );
  
    window.objectFocus = {
      getFocusedRootId,
      getFocusedRootNode,
      getFocusedRootOrdinalPath,
      focusInto,
      focusOutTo,
      resetFocus,
      renderBreadcrumbs,
    };
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderBreadcrumbs);
    } else {
      renderBreadcrumbs();
    }
  })();