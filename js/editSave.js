// notesData = [
//   {
//     id: 1,
//     title: "Kali Install",
//     content:
//       "WSL2 + Powershell setup steps: [img:img1] Ensure virtualization is enabled. [img:img2] Then install Kali using the WSL2 backend. [img:img3]",
//     images: [
//       {
//         id: "img1",
//         url: "https://images.unsplash.com/photo-1614064641938-3bbee52942b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
//       },
//       {
//         id: "img2",
//         url: "https://images.unsplash.com/photo-1581091215367-59b4d977ff56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
//       },
//       {
//         id: "img3",
//         url: "https://images.unsplash.com/photo-1581090700227-4c9f37fcb4b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "CSS Reset",
//     content:
//       "Use a CSS reset to remove browser inconsistencies and improve layout predictability.",
//     images: [],
//   },
//   {
//     id: 3,
//     title: "Steps to Django Changes",
//     content:
//       "Run `python manage.py makemigrations` to detect changes. Apply them using `python manage.py migrate`.",
//     images: [],
//   },
//   {
//     id: 4,
//     title: "Git Tips",
//     content:
//       "Use `git stash` to temporarily save changes. [img:img1] Reapply with `git stash pop`. [img:img2]",
//     images: [
//       {
//         id: "img1",
//         url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
//       },
//       {
//         id: "img2",
//         url: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
//       },
//     ],
//   },
// ];

// document.addEventListener("DOMContentLoaded", () => {
//   let currentNote = null;
//   let originalParent = null;

//   document.body.addEventListener("click", (e) => {
//     if (currentNote && !currentNote.contains(e.target)) {
//       const updatedContent = currentNote.innerText;
//       const noteId = parseInt(currentNote.getAttribute("data-id"));

//       // Find and update note in notesData
//       const noteObj = notesData.find((note) => note.id === noteId);
//       if (noteObj) {
//         noteObj.content = updatedContent;
//         console.log(`Saved note ${noteId}:`, updatedContent);
//       }

//       currentNote.classList.remove("editing");
//       currentNote.removeAttribute("contenteditable");
//       originalParent.appendChild(currentNote);
//       currentNote = null;
//       originalParent = null;
//     }
//   });

//   document.body.addEventListener("click", (e) => {
//     if (e.target.classList.contains("note")) {
//       e.stopPropagation();

//       if (currentNote) return;

//       currentNote = e.target;
//       originalParent = currentNote.parentElement;

//       currentNote.classList.add("editing");
//       currentNote.setAttribute("contenteditable", "true");
//       currentNote.focus();
//     }
//   });
// });
