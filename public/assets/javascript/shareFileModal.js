const shareFileModal = document.querySelector(".share-file-modal");
const shareBtn = document.querySelector(".share");
const shareUrlInput = document.querySelector(".share-url-input");
const generateShareUrl = document.querySelector(".generate-share-url");
const shareLinkForm = document.querySelector(".share-link-form");
const shareFileCloseBtn = document.querySelectorAll(
  ".btn-close__share-file-modal"
);

shareBtn.addEventListener("click", (e) => {
  filesData.forEach((file) => {
    if (e.target.dataset.id === file.id) {
      currFileId = file.id;
    }
  });

  shareFileModal.style.display = "block";
  overlay.style.zIndex = 10;

  shareLinkForm.action = `/drive/get-share-url/${currFileId}`;
});

shareFileCloseBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    shareFileModal.style.display = "none";
    overlay.style.display = "block";
    overlay.style.zIndex = 8;
    shareUrlInput.style.display = "none";
    shareUrlInput.value = "";
  });
});

generateShareUrl.addEventListener("click", async () => {
  const fileId = currFileId;
  try {
    // Use a URL parameter to match the server route
    const response = await fetch(`/drive/get-share-url/${fileId}`);
    const data = await response.json();
    shareUrlInput.style.display = "block";
    shareUrlInput.value = data.downloadUrl;
  } catch (error) {
    console.error("Error fetching share URL:", error);
    shareUrlInput.value = "Error generating link.";
  }
});
