const files = document.querySelectorAll(".file");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeFileInfoBtn = document.querySelectorAll(".btn-close__file-modal");

const filesData = JSON.parse(document.getElementById("file-data").textContent);
let currFileId;

files.forEach((file) =>
  file.addEventListener("click", (e) => {
    const target = e.target.closest(".file");
    file.classList.add("file-active");

    if (target) {
      const fileId = target.dataset.id;
      const fileDetails = filesData.filter(
        (fileData) => fileData.id === fileId
      );
      currFileId = fileDetails[0].id;
      // Get elements from target
      const modalFileName = modal.querySelector(".modal-file-name");
      const modalFileType = modal.querySelector(".modal-file-type");
      const modalFileSize = modal.querySelector(".modal-file-size");
      const modalFileCreatedAt = modal.querySelector(".modal-file-created_at");
      const modalFormDel = modal.querySelector(".modal-form-delete");

      // Populate modal file data
      if (fileDetails[0].folder_id) {
        modalFormDel.action = `/drive/handle-file-actions/${fileDetails[0].folder_id}/${fileDetails[0].id}`;
      } else {
        modalFormDel.action = `/drive/handle-file-actions/${fileDetails[0].id}`;
      }
      const formattedDate = new Date(
        fileDetails[0].created_at
      ).toLocaleDateString();

      modalFileName.textContent = fileDetails[0].name;
      modalFileType.textContent = fileDetails[0].mime_type;

      let isFileInMb = fileDetails[0].size / (1024 * 1024) >= 1;

      const fileInMb = `${(fileDetails[0].size /(1024 * 1024)).toFixed(2)} MB`; // prettier-ignore
      const fileInKb = `${(fileDetails[0].size / 1024).toFixed(2)} KB`; // prettier-ignore

      if (isFileInMb) {
        modalFileSize.textContent = fileInMb;
      } else {
        modalFileSize.textContent = fileInKb;
      }

      modalFileCreatedAt.textContent = formattedDate;

      // Modal + overlay
      modal.style.display = "flex";
      overlay.style.display = "block";
    }
  })
);

closeFileInfoBtn.forEach((btn) =>
  btn.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
    files.forEach((file) => {
      file.classList.remove("file-active");
    });
  })
);
