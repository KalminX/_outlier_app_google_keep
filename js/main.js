// ==================== Sidebar Navigation ====================

// 1. Get all the list items within the sidebar navigation
const sidebarItems = document.querySelectorAll(".sidebar nav ul li");

// 2. Function to handle the click event
function handleItemClick(event) {
  const clickedItem = event.currentTarget; // Get the clicked <li> element

  // Remove the 'active' class from all items
  sidebarItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Add the 'active' class to the clicked item
  clickedItem.classList.add("active");
}

// 3. Add the click event listener to each list item
sidebarItems.forEach((item) => {
  item.addEventListener("click", handleItemClick);
});

// Optional: Highlight the first item by default on page load
if (sidebarItems.length > 0) {
  // sidebarItems[0].classList.add('active');
}

// ==================== Sidebar Toggle ====================

const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
const menu = document.getElementById("menu");

// Toggle sidebar collapse and menu collapse
hamburger.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent the click event from propagating to the body
  sidebar.classList.toggle("collapsed");
  menu.classList.toggle("menu-collapsed");
  sidebar.classList.toggle("collapse");
  distributeNotes();
});

// ==================== Search Input Functionality ====================

// Function to clear the search input
function clearSearchInput() {
  const searchInput = document.querySelector(".search-input");
  const clearButton = document.querySelector(".search-clear");
  searchInput.value = ""; // Clear the input value
  clearButton.style.visibility = "hidden"; // Hide the clear button
}

// Function to toggle the visibility of the clear button
function toggleClearButton(input) {
  const clearButton = document.querySelector(".search-clear");
  if (input.value.trim() !== "") {
    clearButton.style.visibility = "visible"; // Show the clear button
  } else {
    clearButton.style.visibility = "hidden"; // Hide the clear button
  }
}

const listBtn = document.getElementById("list-view-btn");
const gridBtn = document.getElementById("grid-view-btn");
const main = document.querySelector("main");

// Initially hide list-view icon
listBtn.style.display = "none";

listBtn.addEventListener("click", () => {
  main.classList.remove("list-view");
  listBtn.style.display = "none";
  gridBtn.style.display = "inline";
  distributeNotes();
});

gridBtn.addEventListener("click", () => {
  main.classList.add("list-view");
  gridBtn.style.display = "none";
  listBtn.style.display = "inline";
  distributeNotes();
});

function loadNotesToIndexedDB(jsonUrl = "notes.json") {
  const request = indexedDB.open("NotesDB", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("notes")) {
      const store = db.createObjectStore("notes", { keyPath: "id" });
      store.createIndex("title", "title", { unique: false });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    fetch(jsonUrl)
      .then((response) => response.json())
      .then((notes) => {
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");

        notes.forEach((note) => {
          store.put(note);
        });

        tx.oncomplete = () => {
          console.log("Notes loaded into IndexedDB.");
        };
      })
      .catch((err) => console.error("Failed to load JSON:", err));
  };

  request.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
  };
}

function distributeNotes() {
  const request = indexedDB.open("NotesDB", 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");

    const notes = [];
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        notes.push(cursor.value);
        cursor.continue();
      } else {
        // All notes collected, now render
        renderNotes(notes);
      }
    };

    cursorRequest.onerror = (event) => {
      console.error("Failed to read notes:", event.target.error);
    };
  };

  request.onerror = (event) => {
    console.error("Failed to open IndexedDB:", event.target.error);
  };
}

function renderNotes(notes) {
  const columns = document.querySelectorAll(".column");

  columns.forEach((column) => {
    column.innerHTML = "";
  });

  const getVisibleColumns = () =>
    Array.from(columns).filter(
      (column) => getComputedStyle(column).display !== "none"
    );

  const getShortestColumn = () => {
    const visibleColumns = getVisibleColumns();
    return visibleColumns.reduce((shortest, current) =>
      current.offsetHeight < shortest.offsetHeight ? current : shortest
    );
  };

  const renderContentWithImages = (content, images) => {
    return content.replace(/\[img:(\w+)\]/g, (_, imgId) => {
      const image = images.find((img) => img.id === imgId);
      return image
        ? `<br/><img src="${image.url}" alt="image" /><br/>`
        : `[missing image: ${imgId}]`;
    });
  };

  notes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.setAttribute("data-id", note.id);

    const processedContent = renderContentWithImages(note.content, note.images);

    noteElement.innerHTML = `
      <h3>${note.title}</h3>
      <p>${processedContent}</p>
    `;

    const shortestColumn = getShortestColumn();
    if (shortestColumn) {
      shortestColumn.appendChild(noteElement);
    }

    noteElement.addEventListener("click", (e) => {
      console.log("Note clicked:", note);
    });
  });
}

// Run once to load JSON into IndexedDB
loadNotesToIndexedDB();

// Then call this to display notes from IndexedDB
distributeNotes();

let currentNote = null;
let originalParent = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");
  // Ensure notes are distributed before querying
  distributeNotes();

  // Use a slight delay or wait for the DOM update
  setTimeout(() => {
    const notes = document.querySelectorAll(".column .note");
    console.log("Notes loaded:", notes); // Debugging log
    // Create a single file input element to reuse
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    // Attach the change event listener to the file input
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      console.log("File selected:", file); // Debugging log
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          img.style.marginTop = "10px";

          // Add the image to the current note
          if (currentNote) {
            currentNote.appendChild(img);

            // Add a <br> tag immediately after the image
            const br = document.createElement("br");
            currentNote.appendChild(br);

            // Focus the cursor a line after the image
            const range = document.createRange();
            const selection = window.getSelection();
            range.setStartAfter(br);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        };
        reader.readAsDataURL(file);
      }

      // Reset the file input value to allow re-selecting the same file
      fileInput.value = "";
      console.log("File input reset"); // Debugging log
    });

    // Append the file input to the body (hidden)
    document.body.appendChild(fileInput);
  }, 100); // Adjust the delay if necessary
});

document.body.addEventListener("click", (e) => {
  const note = e.target.closest(".note");
  if (!note) return; // Not a note

  e.stopPropagation(); // Prevent body handler

  // Prevent re-trigger if already editing
  if (note.classList.contains("editing")) return;

  ignoreNextBodyClick = true;

  originalParent = note.parentElement;
  currentNote = note;

  note.classList.add("editing");
  note.setAttribute("contenteditable", "true");
  note.focus();

  const uploadButton = document.createElement("button");
  uploadButton.textContent = "Add Image";
  uploadButton.classList.add("add-image-button");
  uploadButton.addEventListener("click", () => fileInput.click());

  note.appendChild(uploadButton);
});

document.body.addEventListener("click", (e) => {
  if (ignoreNextBodyClick) {
    ignoreNextBodyClick = false;
    return;
  }

  const clickedNote = e.target.closest(".note");

  if (currentNote && clickedNote !== currentNote) {
    currentNote.classList.remove("editing");
    currentNote.removeAttribute("contenteditable");

    const uploadButton = currentNote.querySelector("button");
    if (uploadButton) uploadButton.remove();

    originalParent.appendChild(currentNote);
    currentNote = null;
    originalParent = null;
  }
});

// Redistribute notes on window resize
window.addEventListener("resize", distributeNotes);
