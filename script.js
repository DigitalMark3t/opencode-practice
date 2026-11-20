/* ==========================================================================
   THE SIDE PATH — script.js

   Filtering for the catalogue: one search field, one pillar button group,
   and one genre dropdown. Every control writes into a single shared "state"
   object, and updateCatalogue() decides what should be visible.

   How the three conditions combine: an entry is shown only when it matches
   the search text AND the selected pillar AND the selected genre.
   Choosing "all" in a group switches that condition off.

   The "Clear filters" action simply resets those three values; it does not
   contain any filtering logic of its own.

   The <script> tag in index.html uses the "defer" attribute, so this file
   runs after the HTML has loaded and the elements below already exist.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. FIND THE ELEMENTS
   querySelectorAll returns a NodeList: a list of every element matching the
   CSS-style selector. querySelector returns just the first match.
   -------------------------------------------------------------------------- */

var searchInput = document.querySelector("#catalogue-search");
var categoryButtons = document.querySelectorAll(".category-button");
var genreSelect = document.querySelector("#catalogue-genre");
var clearButton = document.querySelector(".catalogue-clear");
var catalogueCards = document.querySelectorAll(".catalogue-card");
var statusMessage = document.querySelector(".filter-status");
var emptyState = document.querySelector(".catalogue-empty");

/* The total is the size of the whole catalogue. It never changes while
   filtering, which is why it is stored once. */
var totalEntries = catalogueCards.length;


/* --------------------------------------------------------------------------
   2. SHARED STATE
   All three controls write into this one object, so no control ever needs to
   read the others from the page. "all" means "this filter is switched off".
   -------------------------------------------------------------------------- */

var state = {
  search: "",
  category: "all",
  genre: "all"
};


/* --------------------------------------------------------------------------
   3. SEARCH TEXT
   Gather every piece of text a visitor might search for: title, category,
   genre, description, platform, year, and the optional data-search keywords
   from the HTML. The "Editor's pick" badge is deliberately left out.
   Everything is lowercased so matching is case-insensitive.
   -------------------------------------------------------------------------- */

function getSearchText(card) {
  var parts = [
    card.querySelector("h3").textContent,
    card.querySelector(".card-category").textContent,
    card.querySelector(".card-genre").textContent,
    card.querySelector(".card-description").textContent,
    card.dataset.search || ""
  ];

  card.querySelectorAll(".card-meta li").forEach(function (item) {
    parts.push(item.textContent);
  });

  return parts.join(" ").toLowerCase();
}


/* --------------------------------------------------------------------------
   4. THE MAIN FUNCTION
   updateCatalogue() reads the state object and updates everything that
   depends on it: visible cards, the pillar buttons, the genre dropdown, the
   clear action, the live status message, and the empty state.
   -------------------------------------------------------------------------- */

function updateCatalogue() {
  /* Trim and lowercase the search term once, instead of once per card. */
  var query = state.search.trim().toLowerCase();
  var visibleCount = 0;

  catalogueCards.forEach(function (card) {
    var matchesSearch =
      query === "" || getSearchText(card).indexOf(query) !== -1;

    /* card.dataset reads the data-category / data-genre attributes.
       Setting card.hidden = true adds the hidden attribute, which CSS
       turns into display: none. */
    var matchesCategory =
      state.category === "all" || card.dataset.category === state.category;
    var matchesGenre =
      state.genre === "all" || card.dataset.genre === state.genre;

    /* AND logic: every active condition has to be true. */
    var matches = matchesSearch && matchesCategory && matchesGenre;

    card.hidden = !matches;

    if (matches) {
      visibleCount = visibleCount + 1;
    }
  });

  /* Each group is updated on its own, so exactly one pillar button is
     pressed and the groups never reset each other. The dropdown is simply
     told which genre is active. */
  categoryButtons.forEach(function (button) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === state.category)
    );
  });

  genreSelect.value = state.genre;

  /* The clear action only makes sense while something is filtered. */
  clearButton.disabled = !hasActiveFilters();

  /* The second number is always the whole catalogue, never the filtered
     count. "entries" matches the site's catalogue terminology. */
  statusMessage.textContent =
    "Showing " + visibleCount + " of " + totalEntries + " entries.";

  /* Show the empty state only when nothing matches. */
  emptyState.hidden = visibleCount !== 0;
}


/* --------------------------------------------------------------------------
   5. IS ANYTHING FILTERED?
   Used only to enable or disable the clear action. A search term or any
   group set to something other than "all" counts as active.
   -------------------------------------------------------------------------- */

function hasActiveFilters() {
  return (
    state.search.trim() !== "" ||
    state.category !== "all" ||
    state.genre !== "all"
  );
}


/* --------------------------------------------------------------------------
   6. LISTEN FOR CHANGES
   Each control changes one field of the state object and then asks
   updateCatalogue() to redraw. No other field is touched, so the other
   controls keep their current values.
   -------------------------------------------------------------------------- */

/* "input" fires on every keystroke and also when the field is cleared,
   including the browser's built-in clear button. */
searchInput.addEventListener("input", function () {
  state.search = searchInput.value;
  updateCatalogue();
});

categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    state.category = button.dataset.category;
    updateCatalogue();
  });
});

/* "change" fires when a different genre is chosen, including by keyboard. */
genreSelect.addEventListener("change", function () {
  state.genre = genreSelect.value;
  updateCatalogue();
});

/* Clearing resets every condition. updateCatalogue() then brings the
   field, the buttons, the dropdown, and the status message back in line. */
clearButton.addEventListener("click", function () {
  state.search = "";
  state.category = "all";
  state.genre = "all";

  searchInput.value = "";
  updateCatalogue();
});


/* --------------------------------------------------------------------------
   7. STARTING STATE
   Draw the catalogue once on load so the controls, cards, status message,
   and empty state all match the state object from the very beginning.
   -------------------------------------------------------------------------- */

updateCatalogue();
