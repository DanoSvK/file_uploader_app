const { Router } = require("express");
const uploadRouter = Router();
const controller = require("../controllers/dbController");

// Setup Multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Handle file upload
uploadRouter.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    await controller.insertFile(req, res);
  } catch (err) {
    next(err);
  }
});

uploadRouter.post(
  "/:folderId/file",
  upload.single("file"),
  async (req, res) => {
    try {
      await controller.insertFile(req, res);
    } catch (err) {
      next(err);
    }
  }
);

uploadRouter.post("/folder", async (req, res) => {
  try {
    await controller.insertFolder(req, res);
  } catch (err) {
    next(err);
  }
});

uploadRouter.post("/folder/:folderID", async (req, res) => {
  try {
    await controller.insertFolder(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = uploadRouter;
