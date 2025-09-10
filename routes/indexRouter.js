const { Router } = require("express");
const indexRouter = Router();
const requireLogin = require("../middlewares/authMiddleware");
const controller = require("../controllers/dbController");

indexRouter.get("/get-share-url/:fileId", (req, res) => {
  // Let's assume you're passing the fileId as a query parameter
  const fileId = req.params.fileId;

  // Call your controller to generate the actual URL
  const downloadUrl = controller.createShareableLink(fileId, req);

  // Send back just the URL as a piece of data
  res.json({ downloadUrl: downloadUrl });
});

indexRouter.get("/", requireLogin, async (req, res) => {
  try {
    const files = await controller.getAllNonFolderFiles();
    const folders = await controller.getAllParentFolders();
    const username = req.user.username;

    res.render("main", {
      title: "Homepage",
      files: files,
      folders: folders,
      username: username,
    });
  } catch (err) {
    next(err);
  }
});

indexRouter.post("/handle-file-actions/:fileId", async (req, res) => {
  try {
    if (req.body.delete) {
      console.log("test");
      await controller.deleteNonFolderFileById(req, res);
    } else if (req.body.download) {
      await controller.downloadFile(req, res);
    }
  } catch (err) {
    next(err);
  }
});

indexRouter.get("/download/:fileId", async (req, res) => {
  await controller.downloadFile(req, res);
});

indexRouter.post("/handle-file-actions/:folderId/:fileId", async (req, res) => {
  if (req.body.share) {
    console.log("share");
  } else if (req.body.delete) {
    await controller.deleteNonFolderFileById(req, res);
  } else if (req.body.download) {
    await controller.downloadFile(req, res);
  }
});

indexRouter.get("/:folderID", async (req, res) => {
  const folders = await controller.getChildFoldersByParentId(req, res);
  const files = await controller.getChildFilesByParentId(req, res);
  const breadcrumb = await controller.getBreadcrumb(req, res);
  const folderId = req.params.folderID;
  const username = req.user.username;

  res.render("folder", {
    title: "Folder",
    folders: folders,
    files: files,
    folderId: folderId,
    breadcrumb: breadcrumb,
    username: username,
  });
});

indexRouter.post("/handle-folder-actions/:folderId", async (req, res) => {
  if (req.body.delete) {
    await controller.deleteFolder(req, res);
    console.log("est");
  } else if (req.body.rename) {
    controller.renameFolder(req, res);
  } else if (req.body.download) {
    controller.downloadFolder(req, res);
  }
});

indexRouter.post("/:folderId/:fileId", async (req, res) => {
  try {
    await controller.deleteFolderFileById(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = indexRouter;
