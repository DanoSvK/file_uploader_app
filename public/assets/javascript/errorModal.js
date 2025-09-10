const form = document.querySelector(".upload-file-form");
const errorModal = document.querySelector("#error-modal");
const modalOverlay = document.querySelector(".modal-overlay");
const modalMessage = document.querySelector(".modal-message");
const modalCloseBtn = document.querySelector(".modal-close");

function showModal(message) {
  modalMessage.textContent = message;
  modalOverlay.style.display = "flex";
}

modalCloseBtn.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

async function uploadFile(data) {
  try {
    const res = await fetch("/upload/file", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    if (result.status === "success") {
      window.location.href = result.redirectUrl;
    } else {
      showModal(result.message || "Something went wrong.");
    }
  } catch (err) {
    showModal("Could not connect to server. Try again later.");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  uploadFile(formData);
});
