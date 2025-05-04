// ==================== Sidebar Navigation ====================
const sidebarItems = document.querySelectorAll(".sidebar nav ul li");

function handleItemClick(event) {
  sidebarItems.forEach((item) => item.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

sidebarItems.forEach((item) => item.addEventListener("click", handleItemClick));

// ==================== Sidebar Toggle ====================
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
const menu = document.getElementById("menu");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("collapsed");
  menu.classList.toggle("menu-collapsed");
  sidebar.classList.toggle("collapse");
  distributeNotes();
});

// ==================== Search Input Functionality ====================
function clearSearchInput() {
  document.querySelector(".search-input").value = "";
  document.querySelector(".search-clear").style.visibility = "hidden";
}

function toggleClearButton(input) {
  const clearButton = document.querySelector(".search-clear");
  clearButton.style.visibility = input.value.trim() ? "visible" : "hidden";
}

// ==================== View Toggle ====================
const listBtn = document.getElementById("list-view-btn");
const gridBtn = document.getElementById("grid-view-btn");
const main = document.querySelector("main");

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

// ==================== IndexedDB Handling ====================
function loadNotesToIndexedDB(jsonUrl = "notes.json") {
  const request = indexedDB.open("NotesDB", 1);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("notes")) {
      const store = db.createObjectStore("notes", { keyPath: "id" });
      store.createIndex("title", "title", { unique: false });
    }
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    fetch(jsonUrl)
      .then((res) => res.json())
      .then((notes) => {
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");
        notes.forEach((note) => store.put(note));
        tx.oncomplete = () => console.log("Notes loaded into IndexedDB.");
      })
      .catch((err) => console.error("Failed to load JSON:", err));
  };

  request.onerror = (e) => {
    console.error("Error opening IndexedDB:", e.target.error);
  };
}

function distributeNotes() {
  const request = indexedDB.open("NotesDB", 1);

  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");

    const notes = [];
    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        notes.push(cursor.value);
        cursor.continue();
      } else {
        renderNotes(notes);
      }
    };
  };

  request.onerror = (e) => {
    console.error("Failed to open IndexedDB:", e.target.error);
  };
}

// ==================== Render Notes ====================
function renderNotes(notes) {
  const columns = document.querySelectorAll(".column");
  columns.forEach((col) => (col.innerHTML = ""));

  const getVisibleColumns = () =>
    Array.from(columns).filter(
      (col) => getComputedStyle(col).display !== "none"
    );

  const getShortestColumn = () =>
    getVisibleColumns().reduce((shortest, current) =>
      current.offsetHeight < shortest.offsetHeight ? current : shortest
    );

  const renderContentWithImages = (content, images) =>
    content.replace(/\[img:(\w+)\]/g, (_, id) => {
      const image = images.find((img) => img.id === id);
      return image
        ? `<br/><img src="${image.url}" alt="image" /><br/>`
        : `[missing image: ${id}]`;
    });

  notes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.setAttribute("data-id", note.id);
    noteElement.innerHTML = `<h3>${note.title}</h3><p>${renderContentWithImages(
      note.content,
      note.images
    )}</p>`;

    const shortestColumn = getShortestColumn();
    if (shortestColumn) shortestColumn.appendChild(noteElement);

    noteElement.addEventListener("click", () => {
      console.log("Note clicked:", note);
    });
  });
}

// ==================== Editable Notes & Image Upload ====================
let currentNote = null;
let originalParent = null;
let ignoreNextBodyClick = false;
let fileInput;

document.addEventListener("DOMContentLoaded", () => {
  distributeNotes();

  setTimeout(() => {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          img.style.marginTop = "10px";

          if (currentNote) {
            currentNote.appendChild(img);
            const br = document.createElement("br");
            currentNote.appendChild(br);

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
      fileInput.value = "";
    });

    document.body.appendChild(fileInput);
  }, 100);
});

document.body.addEventListener("click", (e) => {
  const note = e.target.closest(".note");

  // If you clicked outside any note and there's a note being edited, turn off editing.
  if (!note) {
    const editingNote = document.querySelector(".note.editing");
    if (editingNote) {
      editingNote.classList.remove("editing");
      editingNote.removeAttribute("contenteditable");

      // Remove the upload button if present
      const uploadBtn = editingNote.querySelector(".add-image-button");
      if (uploadBtn) uploadBtn.remove();
    }
    return;
  }

  // If you click the same note that's already being edited, do nothing.
  if (note.classList.contains("editing")) return;

  // If another note is being edited, stop editing that one first.
  const editingNote = document.querySelector(".note.editing");
  if (editingNote) {
    editingNote.classList.remove("editing");
    editingNote.removeAttribute("contenteditable");

    const uploadBtn = editingNote.querySelector(".add-image-button");
    if (uploadBtn) uploadBtn.remove();
  }

  // Start editing the clicked note
  e.stopPropagation();

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

// ==================== Initial Load & Resize Handling ====================
loadNotesToIndexedDB();
distributeNotes();

window.addEventListener("resize", distributeNotes);
