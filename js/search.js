const searchInput = document.querySelector(".search-input");
const columns = document.querySelectorAll(".column");

// Render notes into columns (simple round-robin layout)
function renderNotes(filteredNotes, highlight = "") {
  columns.forEach((col) => (col.innerHTML = ""));

  let colIndex = 0;
  const regex = new RegExp(`(${highlight})`, "gi");

  filteredNotes.forEach((note) => {
    const title = highlight
      ? note.title.replace(regex, "<mark>$1</mark>")
      : note.title;
    const content = highlight
      ? note.content.replace(regex, "<mark>$1</mark>")
      : note.content;

    const noteHTML = `
            <div class="note">
              <h3 class="note-title">${title}</h3>
              <p class="note-content">${content}</p>
            </div>
          `;

    columns[colIndex].innerHTML += noteHTML;
    colIndex = (colIndex + 1) % columns.length;
  });
}

// Initial render
fetch("notes.json")
  .then((response) => {
    if (!response.ok) throw new Error("Failed to load notes file.");
    return response.json();
  })
  .then((data) => {
    renderNotes(data); // Call with data from file
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (query === "") {
        renderNotes(data);
        return;
      }

      const regex = new RegExp(query, "i");

      const filtered = data.filter(
        (note) => regex.test(note.title) || regex.test(note.content)
      );

      renderNotes(filtered, query);
    });

  })
  .catch((error) => {
    console.error("Error loading notes:", error);
  });
  
// On search input
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query === "") {
    renderNotes(notesData);
    return;
  }

  const regex = new RegExp(query, "i");

  const filtered = notesData.filter(
    (note) => regex.test(note.title) || regex.test(note.content)
  );

  renderNotes(filtered, query);
});

// Clear input
function clearSearchInput() {
  searchInput.value = "";
  renderNotes(data);
}

// Toggle clear button visibility (optional)
function toggleClearButton(input) {
  const clearBtn = document.querySelector(".search-clear");
  clearBtn.style.display = input.value ? "inline" : "none";
}

