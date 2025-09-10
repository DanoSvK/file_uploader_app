const folderModal = document.querySelector(".folder-form");
const fileModal = document.querySelector(".file-form");

const addFolderBtn = document.querySelector(".add-folder-btn");
const addFileBtn = document.querySelector(".add-file-btn");

const closeBtns = document.querySelectorAll(".btn-close");

addFolderBtn.addEventListener("click", () => {
  folderModal.style.display = "block";
  overlay.style.display = "block";
});

addFileBtn.addEventListener("click", () => {
  fileModal.style.display = "block";
  overlay.style.display = "block";
});

closeBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    folderModal.style.display = "none";
    fileModal.style.display = "none";
    overlay.style.display = "none";
  })
);
