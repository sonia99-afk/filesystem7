// autosave.js
(function () {
    if (typeof window === "undefined") return;
  
    const STORAGE_KEY = "org_structure_project_autosave_v1";
    const SAVE_DELAY = 250;
  
    let saveTimer = null;
    let isRestoring = false;
  
    function saveNow() {
      if (isRestoring) return;
      if (typeof snapshot !== "function") return;
  
      try {
        localStorage.setItem(STORAGE_KEY, snapshot());
      } catch (_) {}
    }
  
    function scheduleSave() {
      if (isRestoring) return;
  
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, SAVE_DELAY);
    }
  
    function restoreSaved() {
      if (typeof restore !== "function") return false;
  
      let raw = null;
  
      try {
        raw = localStorage.getItem(STORAGE_KEY);
      } catch (_) {}
  
      if (!raw) return false;
  
      try {
        isRestoring = true;
        restore(raw);
        return true;
      } catch (_) {
        return false;
      } finally {
        isRestoring = false;
      }
    }
  
    function patchHistory() {
      if (typeof pushHistory !== "function") return;
      if (window.pushHistory.__autosavePatched) return;
  
      const originalPushHistory = window.pushHistory;
  
      window.pushHistory = function patchedPushHistory() {
        const result = originalPushHistory.apply(this, arguments);
        scheduleSave();
        return result;
      };
  
      window.pushHistory.__autosavePatched = true;
    }
  
    function patchRender() {
      if (typeof render !== "function") return;
      if (window.render.__autosavePatched) return;
  
      const originalRender = window.render;
  
      window.render = function patchedRenderAutosave() {
        const result = originalRender.apply(this, arguments);
        scheduleSave();
        return result;
      };
  
      window.render.__autosavePatched = true;
    }
  
    function init() {
      restoreSaved();
  
      patchHistory();
      patchRender();
  
      if (typeof render === "function") {
        render();
      }
  
      window.addEventListener("beforeunload", saveNow);
    }
  
    window.projectAutosave = {
      saveNow,
      restoreSaved,
      clear() {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      },
    };
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();