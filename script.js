/* ==========================================================================
   GAME DISCOVERY — script.js

   Adds a genre filter to the Featured Games section.

   How it works, in three steps:
   1. Find the buttons, the game cards, and the status message on the page.
   2. Listen for a click on any filter button.
   3. When one is clicked, show only the matching cards and update the
      button states and the status message.

   The <script> tag in index.html uses the "defer" attribute, which means
   this file runs only after the HTML has finished loading. That is why the
   elements below can be found immediately.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. FIND THE ELEMENTS
   querySelectorAll returns a NodeList: a list of every element that matches
   the CSS-style selector. querySelector returns just the first match.
   -------------------------------------------------------------------------- */

var filterButtons = document.querySelectorAll(".filter-button");
var gameCards = document.querySelectorAll("#featured article");
var statusMessage = document.querySelector(".filter-status");


/* --------------------------------------------------------------------------
   2. THE MAIN FUNCTION
   applyFilter() does one complete job: given a genre, show the matching
   cards and update every piece of interface that depends on it.
   -------------------------------------------------------------------------- */

function applyFilter(genre, label) {
  var visibleCount = 0;

  /* Loop over every game card and decide whether it should be visible.
     card.dataset.genre reads the data-genre="..." attribute from the HTML.
     Setting card.hidden = true adds the hidden attribute, which CSS turns
     into display: none. */
  gameCards.forEach(function (card) {
    var matches = genre === "all" || card.dataset.genre === genre;

    card.hidden = !matches;

    if (matches) {
      visibleCount = visibleCount + 1;
    }
  });

  /* Mark the clicked button as selected and all others as not selected.
     aria-pressed is a real accessibility signal: screen readers announce
     the button as "pressed" or "not pressed". */
  filterButtons.forEach(function (button) {
    var isSelected = button.dataset.filter === genre;
    button.setAttribute("aria-pressed", String(isSelected));
  });

  /* Update the status message. Singular and plural need different wording. */
  var gameWord = visibleCount === 1 ? "game" : "games";

  if (genre === "all") {
    statusMessage.textContent = "Showing all " + visibleCount + " " + gameWord + ".";
  } else {
    statusMessage.textContent =
      "Showing " + visibleCount + " " + gameWord + " in " + label + ".";
  }
}


/* --------------------------------------------------------------------------
   3. LISTEN FOR CLICKS
   Each button gets its own click listener. When clicked, it passes its
   data-filter value ("racing", "rpg", ...) and its visible text label
   ("Racing", "RPG", ...) to applyFilter().
   -------------------------------------------------------------------------- */

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    applyFilter(button.dataset.filter, button.textContent);
  });
});


/* --------------------------------------------------------------------------
   4. STARTING STATE
   Show every game when the page first loads. Reusing applyFilter() keeps the
   buttons, cards, and status message in sync from the very beginning.
   -------------------------------------------------------------------------- */

applyFilter("all", "All");
