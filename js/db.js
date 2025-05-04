const dbName = "notesApp";
const storeName = "notes";

// Open the database
let db;

const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains(storeName)) {
    const store = db.createObjectStore(storeName, { keyPath: "id" });
    store.createIndex("title", "title", { unique: false });
    store.createIndex("content", "content", { unique: false });
    store.createIndex("images", "images", { unique: false })
  }
};

function saveNoteToDB(note) {
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);

  const request = store.put(note); // The 'put' method will insert or update the note based on its ID

  request.onsuccess = function () {
    console.log("Note saved/updated successfully:", note);
  };

  request.onerror = function (e) {
    console.error("Error saving note:", e);
  };
}

function getNotesFromDB(callback) {
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll(); // Retrieves all notes

  request.onsuccess = function () {
    callback(request.result); // Return the result to the callback
  };

  request.onerror = function (e) {
    console.error("Error fetching notes:", e);
  };
}



request.onsuccess = function (e) {
  db = e.target.result;
  console.log("Database opened successfully");
};

request.onerror = function (e) {
  console.error("Error opening database:", e);
};
