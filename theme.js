/* ==========================================================================
   THE SIDE PATH — theme.js

   Shared by the homepage and the editorial article page. It decides which
   colour theme to show and remembers a manual choice.

   Order of preference:
   1. A saved choice in localStorage (the visitor pressed the theme toggle).
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
     swaps its palette tokens. Every toggle button is kept in sync from here.
     ------------------------------------------------------------------------ */

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateToggles(theme) {
    var nextName = theme === "dark" ? "light" : "dark";
    var toggles = document.querySelectorAll("[data-theme-toggle]");

    toggles.forEach(function (toggle) {
      toggle.textContent = nextName === "dark" ? "Dark" : "Light";
      toggle.setAttribute("aria-label", "Switch to " + nextName + " theme");
      toggle.setAttribute("title", "Switch to " + nextName + " theme");
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
     4. WIRE UP THE TOGGLE BUTTONS
     The buttons ship with the "hidden" attribute so they never appear as a
     dead control when JavaScript is unavailable.
     ------------------------------------------------------------------------ */

  function wireToggles() {
    var toggles = document.querySelectorAll("[data-theme-toggle]");

    toggles.forEach(function (toggle) {
      toggle.hidden = false;

      toggle.addEventListener("click", function () {
        var theme = currentTheme() === "dark" ? "light" : "dark";
        savePreference(theme);
        applyTheme(theme);
      });
    });

    updateToggles(currentTheme());
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
