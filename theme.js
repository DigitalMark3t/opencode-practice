/* ==========================================================================
   THE SIDE PATH — theme.js

   Shared by the homepage and the editorial article page. It decides which
   colour theme to show and remembers a manual choice.

   Order of preference:
   1. A saved choice in localStorage (the visitor pressed a theme option).
   2. The operating system setting (prefers-color-scheme).

   The file is loaded in the <head> without "defer", before the stylesheet,
   so the data-theme attribute is in place before the page paints. The
   catalogue's script.js is separate and only runs on the homepage.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "sidepath-theme";
  var root = document.documentElement;
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");


  /* ------------------------------------------------------------------------
     1. PREFERENCES
     localStorage can throw when storage is blocked (for example in some
     private modes), so every access is guarded.
     ------------------------------------------------------------------------ */

  function readPreference() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function savePreference(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* The theme still applies for this visit, it just is not remembered. */
    }
  }

  function systemPreference() {
    return systemTheme.matches ? "dark" : "light";
  }


  /* ------------------------------------------------------------------------
     2. APPLYING THE THEME
     The theme lives on <html data-theme="...">. CSS reads that attribute and
     swaps its palette tokens. Every theme option is kept in sync from here.
     ------------------------------------------------------------------------ */

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateToggles(theme) {
    var options = document.querySelectorAll("[data-theme-value]");

    options.forEach(function (option) {
      var value = option.getAttribute("data-theme-value");
      var isActive = value === theme;
      var label = value === "dark" ? "Dark theme" : "Light theme";

      option.setAttribute("aria-label", label);
      option.setAttribute("aria-pressed", isActive ? "true" : "false");
      option.setAttribute("title", label);
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    updateToggles(theme);
  }


  /* ------------------------------------------------------------------------
     3. RESOLVE THE STARTING THEME
     ------------------------------------------------------------------------ */

  applyTheme(readPreference() || systemPreference());


  /* ------------------------------------------------------------------------
     4. WIRE UP THE THEME OPTIONS
     The switcher ships with the "hidden" attribute so it never appears as a
     dead control when JavaScript is unavailable. Each button selects its own
     theme directly, and aria-pressed exposes the current selection.
     ------------------------------------------------------------------------ */

  function wireToggles() {
    updateToggles(currentTheme());

    var switchers = document.querySelectorAll("[data-theme-toggle]");

    switchers.forEach(function (switcher) {
      switcher.hidden = false;
    });

    var options = document.querySelectorAll("[data-theme-value]");

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        var theme = option.getAttribute("data-theme-value");

        if (theme !== "light" && theme !== "dark") {
          return;
        }

        savePreference(theme);
        applyTheme(theme);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggles);
  } else {
    wireToggles();
  }


  /* ------------------------------------------------------------------------
     5. FOLLOW LATER CHANGES
     - The operating system theme only matters while no manual choice exists.
     - The storage event keeps a second open tab in sync.
     ------------------------------------------------------------------------ */

  function handleSystemChange() {
    if (readPreference() === null) {
      applyTheme(systemPreference());
    }
  }

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", handleSystemChange);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(handleSystemChange);
  }

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    applyTheme(readPreference() || systemPreference());
  });
})();
