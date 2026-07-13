// autosave.js
// Мультипроектное автосохранение с раздельным хранением проектов.
// При старте грузится только index + активный проект.
// Остальные проекты подгружаются только при переключении.

(function () {
  if (typeof window === "undefined") return;

  const INDEX_KEY = "org_structure_projects_index_v1";
  const PROJECT_DATA_PREFIX = "org_structure_project_data_";

  // Старые ключи для автоматической миграции.
  const OLD_MULTI_KEY = "org_structure_projects_v1";
  const OLD_SINGLE_KEY = "org_structure_project_autosave_v1";

  const SAVE_DELAY = 250;

  let store = null;
  let saveTimer = null;
  let isRestoring = false;

  function projectUid() {
    return (
      "project_" +
      Math.random().toString(36).slice(2, 9) +
      "_" +
      Date.now().toString(36)
    );
  }

  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function projectDataKey(projectId) {
    return PROJECT_DATA_PREFIX + projectId;
  }

  function readProjectData(projectId) {
    if (!projectId) return null;

    try {
      return localStorage.getItem(projectDataKey(projectId));
    } catch (_) {
      return null;
    }
  }

  function writeProjectData(projectId, data) {
    if (!projectId || !data) return;

    try {
      localStorage.setItem(projectDataKey(projectId), data);
    } catch (_) {}
  }

  function removeProjectData(projectId) {
    if (!projectId) return;

    try {
      localStorage.removeItem(projectDataKey(projectId));
    } catch (_) {}
  }

  function plainFromHtml(html) {
    if (typeof htmlPlainText === "function") {
      return htmlPlainText(html);
    }

    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    return (tmp.textContent || "").trim();
  }

  function getTitleFromSnapshot(raw) {
    const data = typeof raw === "string" ? safeParse(raw) : raw;
    const rootNode = data?.root;

    if (!rootNode) return "Проект";

    const htmlTitle = rootNode.nameHtml ? plainFromHtml(rootNode.nameHtml) : "";
    const textTitle = String(rootNode.name || "").trim();

    return htmlTitle || textTitle || "Проект";
  }

  function getTitleFromCurrentRoot() {
    const htmlTitle = root?.nameHtml ? plainFromHtml(root.nameHtml) : "";
    const textTitle = String(root?.name || "").trim();

    return htmlTitle || textTitle || "Проект";
  }

  function makeEmptyProjectSnapshot(title = "Новый проект") {
    const newRoot = makeNode(LEVEL.COMPANY, title);

    return JSON.stringify({
      root: newRoot,
      selectedId: newRoot.id,
      treeHasFocus: true,
      currentView: VIEW.SCHEMA,
      viewOrientation: VIEW_ORIENTATION.VERTICAL,
      showOrdinals: true,
      showCaptions: true,

      __fmtMap: {},
      __colorFmtMap: {},
      __blockBgMap: {},
      __markMap: {},
      __markHiddenMap: {},
      __levelHeaderNames: {},
    });
  }

  function normalizeIndex(nextStore) {
    if (!nextStore || typeof nextStore !== "object") return null;
    if (!Array.isArray(nextStore.projects)) return null;

    const projects = nextStore.projects
      .filter((project) => project && project.id)
      .map((project) => ({
        id: String(project.id),
        title: project.title || "Проект",
        updatedAt: project.updatedAt || Date.now(),
      }));

    if (!projects.length) return null;

    let activeId = nextStore.activeId;

    if (!activeId || !projects.some((project) => project.id === activeId)) {
      activeId = projects[0].id;
    }

    return {
      version: 1,
      activeId,
      projects,
    };
  }

  function writeIndex() {
    if (!store) return;

    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  function migrateFromOldMultiStore() {
    let oldRaw = null;

    try {
      oldRaw = localStorage.getItem(OLD_MULTI_KEY);
    } catch (_) {}

    const oldStore = safeParse(oldRaw);

    if (!oldStore || !Array.isArray(oldStore.projects) || !oldStore.projects.length) {
      return null;
    }

    const nextProjects = [];

    oldStore.projects.forEach((oldProject) => {
      if (!oldProject?.id || !oldProject?.data) return;

      const id = String(oldProject.id);
      const data = oldProject.data;

      writeProjectData(id, data);

      nextProjects.push({
        id,
        title: oldProject.title || getTitleFromSnapshot(data),
        updatedAt: oldProject.updatedAt || Date.now(),
      });
    });

    if (!nextProjects.length) return null;

    let activeId = oldStore.activeId;

    if (!activeId || !nextProjects.some((project) => project.id === activeId)) {
      activeId = nextProjects[0].id;
    }

    return {
      version: 1,
      activeId,
      projects: nextProjects,
    };
  }

  function createInitialIndexFromSingleProject() {
    let oldSnapshot = null;

    try {
      oldSnapshot = localStorage.getItem(OLD_SINGLE_KEY);
    } catch (_) {}

    if (!oldSnapshot && typeof snapshot === "function") {
      oldSnapshot = snapshot();
    }

    if (!oldSnapshot) {
      oldSnapshot = makeEmptyProjectSnapshot("Проект");
    }

    const id = projectUid();

    writeProjectData(id, oldSnapshot);

    return {
      version: 1,
      activeId: id,
      projects: [
        {
          id,
          title: getTitleFromSnapshot(oldSnapshot),
          updatedAt: Date.now(),
        },
      ],
    };
  }

  function loadIndex() {
    let raw = null;

    try {
      raw = localStorage.getItem(INDEX_KEY);
    } catch (_) {}

    const parsed = normalizeIndex(safeParse(raw));

    if (parsed) {
      return parsed;
    }

    const migrated = migrateFromOldMultiStore();

    if (migrated) {
      store = migrated;
      writeIndex();
      return migrated;
    }

    const initial = createInitialIndexFromSingleProject();

    store = initial;
    writeIndex();

    return initial;
  }

  function getActiveProjectMeta() {
    if (!store) return null;
    return store.projects.find((project) => project.id === store.activeId) || null;
  }

  function getProjectMeta(projectId) {
    if (!store) return null;
    return store.projects.find((project) => project.id === projectId) || null;
  }

  function getProjectIdFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("project") || "";
  }

  function getViewFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("view") || "schema";
  }

  function setProjectUrl(projectId, options = {}) {
    if (!projectId) return;

    const url = new URL(window.location.href);
    url.searchParams.set("project", projectId);

    const next = url.pathname + url.search + url.hash;
    const current =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    if (next === current) return;

    const state = {
      project: projectId,
      view: url.searchParams.get("view") || "schema",
    };

    if (options.replace) {
      history.replaceState(state, "", next);
    } else {
      history.pushState(state, "", next);
    }
  }

  function commitActiveEdit() {
    const ae = document.activeElement;

    if (ae && typeof ae.blur === "function") {
      ae.blur();
    }
  }

  function updateActiveProjectTitleFromCurrentRoot() {
    if (!store) return;

    const project = getActiveProjectMeta();
    if (!project) return;

    const nextTitle = getTitleFromCurrentRoot();

    if (project.title !== nextTitle) {
      project.title = nextTitle;
      project.updatedAt = Date.now();
      writeIndex();
    }

    const btn = document.querySelector(
      `.project-item[data-project-id="${cssEscape(project.id)}"]`
    );

    if (btn) {
      btn.textContent = nextTitle;
      btn.title = nextTitle;
    }
  }

  function saveActiveProject() {
    if (isRestoring) return;
    if (!store) return;
    if (typeof snapshot !== "function") return;

    const project = getActiveProjectMeta();
    if (!project) return;

    const data = snapshot();
    const nextTitle = getTitleFromSnapshot(data);

    writeProjectData(project.id, data);

    const titleChanged = project.title !== nextTitle;

    project.title = nextTitle;
    project.updatedAt = Date.now();

    writeIndex();

    if (titleChanged) {
      updateActiveProjectTitleFromCurrentRoot();
    }
  }

  function scheduleSave() {
    if (isRestoring) return;

    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveActiveProject, SAVE_DELAY);
  }

  function currentViewOrSchema() {
    if (typeof currentView === "string") return currentView;
    return VIEW.SCHEMA;
  }

  function resetHistory() {
    if (Array.isArray(window.undoStack)) window.undoStack.length = 0;
    if (Array.isArray(window.redoStack)) window.redoStack.length = 0;
  }

  function renderCurrentView(view, options = {}) {
    const targetView = view || currentViewOrSchema();

    if (window.appRouter?.open) {
      window.appRouter.open(targetView, {
        updateUrl: options.updateUrl !== false,
        replaceUrl: options.replaceUrl !== false,
      });
      return;
    }

    if (typeof render === "function") {
      render();
    }

    if (typeof syncViewButtons === "function") {
      syncViewButtons();
    }
  }

  function restoreProjectByData(project, data, options = {}) {
    if (!project || !data || typeof restore !== "function") return;

    const viewToKeep = options.view || currentViewOrSchema();

    try {
      isRestoring = true;

      restore(data, {
        shouldRender: false,
      });

      currentView = viewToKeep;
      treeHasFocus = true;

      if (!findWithParent(root, selectedId)) {
        selectedId = root.id;
      }

      resetHistory();
    } catch (err) {
      console.error("Не удалось открыть проект", err);
    } finally {
      isRestoring = false;
    }

    renderProjectsSidebar();

    renderCurrentView(viewToKeep, {
      replaceUrl: true,
    });
  }

  function restoreProject(project, options = {}) {
    if (!project) return;

    let data = readProjectData(project.id);

    if (!data) {
      data = makeEmptyProjectSnapshot(project.title || "Проект");
      writeProjectData(project.id, data);
    }

    restoreProjectByData(project, data, options);
  }

  function switchProject(projectId, options = {}) {
    if (!store) return;

    const nextProject = getProjectMeta(projectId);
    if (!nextProject) return;

    if (store.activeId === projectId) {
      if (options.updateUrl !== false) {
        setProjectUrl(projectId, {
          replace: !!options.replaceUrl,
        });
      }

      return;
    }

    commitActiveEdit();
    saveActiveProject();

    const viewToKeep = options.view || currentViewOrSchema();

    store.activeId = projectId;
    writeIndex();

    if (options.updateUrl !== false) {
      setProjectUrl(projectId, {
        replace: !!options.replaceUrl,
      });
    }

    restoreProject(nextProject, {
      view: viewToKeep,
    });
  }

  function createProject() {
    if (!store) return;

    commitActiveEdit();
    saveActiveProject();

    const id = projectUid();
    const title = "Новый проект";
    const data = makeEmptyProjectSnapshot(title);

    writeProjectData(id, data);

    const project = {
      id,
      title,
      updatedAt: Date.now(),
    };

    store.projects.push(project);
    store.activeId = id;

    writeIndex();

    setProjectUrl(id);

    restoreProject(project, {
      view: VIEW.SCHEMA,
    });

    setTimeout(() => {
      treeHasFocus = true;
      selectedId = root.id;
      render?.();
      startRename?.(root.id);
    }, 0);
  }

  function deleteProject(projectId) {
    if (!store) return;

    const idx = store.projects.findIndex((project) => project.id === projectId);
    if (idx < 0) return;

    const project = store.projects[idx];

    if (store.projects.length <= 1) {
      alert("Нельзя удалить последний проект.");
      return;
    }

    const ok = confirm(`Удалить проект «${project.title || "Проект"}»?`);
    if (!ok) return;

    const wasActive = store.activeId === projectId;

    store.projects.splice(idx, 1);
    removeProjectData(projectId);

    if (wasActive) {
      const nextProject =
        store.projects[idx] ||
        store.projects[idx - 1] ||
        store.projects[0];

      store.activeId = nextProject.id;
      writeIndex();

      setProjectUrl(nextProject.id, {
        replace: true,
      });

      restoreProject(nextProject, {
        view: VIEW.SCHEMA,
      });

      return;
    }

    writeIndex();
    renderProjectsSidebar();
  }

  function renderProjectsSidebar() {
    if (!store) return;

    const list = document.querySelector(".projects-list");
    if (!list) return;

    list.innerHTML = "";

    store.projects.forEach((project) => {
      const row = document.createElement("div");
      row.className = "project-row";
      row.dataset.projectId = project.id;

      if (project.id === store.activeId) {
        row.classList.add("in-act");
      }

      const button = document.createElement("button");
      button.className = "project-item";
      button.type = "button";
      button.dataset.projectId = project.id;
      button.textContent = project.title || "Проект";
      button.title = project.title || "Проект";

      if (project.id === store.activeId) {
        button.classList.add("in-act");
      }

      button.addEventListener("click", () => {
        switchProject(project.id);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "project-delete-btn";
      deleteBtn.type = "button";
      deleteBtn.title = "Удалить проект";
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        deleteProject(project.id);
      });

      row.appendChild(button);
      row.appendChild(deleteBtn);

      list.appendChild(row);
    });

    bindAddProjectButton();
  }

  function bindAddProjectButton() {
    const oldButton = document.querySelector(".project-add");
    if (!oldButton) return;

    if (oldButton.dataset.projectsManagerBound === "1") return;

    // Старый initProjectsSidebar уже мог повесить обработчик,
    // который просто добавляет визуальную кнопку. Клонируем,
    // чтобы удалить старые обработчики.
    const button = oldButton.cloneNode(true);
    button.dataset.projectsManagerBound = "1";

    oldButton.replaceWith(button);

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      createProject();
    });
  }

  function patchHistory() {
    if (typeof pushHistory !== "function") return;
    if (window.pushHistory.__projectsAutosavePatched) return;

    const originalPushHistory = window.pushHistory;

    window.pushHistory = function patchedPushHistory() {
      const result = originalPushHistory.apply(this, arguments);
      scheduleSave();
      return result;
    };

    window.pushHistory.__projectsAutosavePatched = true;
  }

  function patchRender() {
    if (typeof render !== "function") return;
    if (window.render.__projectsAutosavePatched) return;

    const originalRender = window.render;

    window.render = function patchedRenderProjectsAutosave() {
      const result = originalRender.apply(this, arguments);

      updateActiveProjectTitleFromCurrentRoot();
      scheduleSave();

      return result;
    };

    window.render.__projectsAutosavePatched = true;
  }

  function restoreSaved() {
    if (!store) {
      store = loadIndex();
    }

    const projectIdFromUrl = getProjectIdFromUrl();

    if (
      projectIdFromUrl &&
      store.projects.some((project) => project.id === projectIdFromUrl)
    ) {
      store.activeId = projectIdFromUrl;
      writeIndex();
    }

    const activeProject = getActiveProjectMeta();
    if (!activeProject) return false;

    let data = readProjectData(activeProject.id);

    if (!data) {
      data = makeEmptyProjectSnapshot(activeProject.title || "Проект");
      writeProjectData(activeProject.id, data);
    }

    setProjectUrl(activeProject.id, {
      replace: true,
    });

    const viewToKeep = getViewFromUrl() || currentViewOrSchema();

    try {
      isRestoring = true;

      restore(data, {
        shouldRender: false,
      });

      currentView = viewToKeep;
      treeHasFocus = true;

      resetHistory();

      return true;
    } catch (err) {
      console.error("Не удалось восстановить проект", err);
      return false;
    } finally {
      isRestoring = false;
    }
  }

  function openProjectFromUrl(options = {}) {
    if (!store) return;

    const projectIdFromUrl = getProjectIdFromUrl();
    if (!projectIdFromUrl) return;

    const project = getProjectMeta(projectIdFromUrl);
    if (!project) return;

    switchProject(projectIdFromUrl, {
      updateUrl: false,
      replaceUrl: true,
      view: options.view || getViewFromUrl(),
    });
  }

  function init() {
    store = loadIndex();

    restoreSaved();

    // Подменяем старые функции сайдбара на мультипроектные.
    window.syncProjectsSidebar = updateActiveProjectTitleFromCurrentRoot;

    window.initProjectsSidebar = function initProjectsSidebar() {
      renderProjectsSidebar();
      bindAddProjectButton();
    };

    patchHistory();
    patchRender();

    renderProjectsSidebar();

    if (typeof render === "function") {
      render();
    }

    window.addEventListener("popstate", () => {
      openProjectFromUrl({
        view: getViewFromUrl(),
      });
    });

    window.addEventListener("beforeunload", () => {
      saveActiveProject();
    });
  }

  window.projectAutosave = {
    saveNow: saveActiveProject,
    restoreSaved,

    createProject,
    switchProject,
    deleteProject,

    getProjects() {
      return store ? store.projects.slice() : [];
    },

    getActiveProjectId() {
      return store?.activeId || null;
    },

    clear() {
      try {
        localStorage.removeItem(INDEX_KEY);
        localStorage.removeItem(OLD_MULTI_KEY);
        localStorage.removeItem(OLD_SINGLE_KEY);

        if (store?.projects?.length) {
          store.projects.forEach((project) => {
            removeProjectData(project.id);
          });
        }
      } catch (_) {}
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();