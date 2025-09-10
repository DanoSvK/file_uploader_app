const folderOptionIcons = document.querySelectorAll(".folder-menu-icon");
const folderOptionsModal = document.querySelector(".folder-options-modal");
const renameFolderBtn = document.querySelector(".rename-folder-btn");
const renameFolderModal = document.querySelector(".rename-folder-modal");
const closeRenameModalBtn = document.querySelector(".btn-close");

const foldersData = JSON.parse(
  document.getElementById("folders-data").textContent
);

let target;

folderOptionIcons.forEach((icon) => {
  icon.addEventListener("click", (e) => {
    // e.stopPropagation();
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;
    folderOptionsModal.style.display = "block";
    folderOptionsModal.style.top = `${y}px`;
    folderOptionsModal.style.left = `${x}px`;
    folderOptionsModal.style.transform = "translate(-100%, 1rem)";

    target = e.target.closest("a");
    if (target) {
      const folderId = target.dataset.id;

      if (folderId) {
        const folderDeleteForm = document.querySelector(
          ".folder-options-modal__form"
        );
        console.log(folderDeleteForm);
        folderDeleteForm.action = `/drive/handle-folder-actions/${folderId}`;
      }
    }
  });
});

renameFolderBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const folderId = target.dataset.id;
  const folderRenameForm = renameFolderModal.querySelector("form");
  folderRenameForm.action = `/drive/handle-folder-actions/${folderId}`;
  renameFolderModal.style.display = "block";
});

closeRenameModalBtn.addEventListener("click", () => {
  renameFolderModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  const icon = e.target.closest(".folder-menu-icon");
  const menu = e.target.closest(".folder-options-modal");

  if (!icon && !menu) {
    folderOptionsModal.style.display = "none";
  }
});
