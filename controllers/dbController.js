const path = require("path");
const fs = require("fs");
const db = require("../db/queries");
const { v4: uuidv4 } = require("uuid");
const archiver = require("archiver");

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks it as "expected"
  }
}

async function insertFile(req, res) {
  try {
    const originalUrl = req.url;
    const element = originalUrl.lastIndexOf("/");
    const slicedUrl = originalUrl.slice(0, element);
    const newUrl = `/drive${slicedUrl}`;
    const fileId = uuidv4();

    const {
      path: oldFilePath,
      originalname,
      mimetype: mimeType,
      size: fileSize,
    } = req.file;

    const ext = path.extname(originalname);
    const newFileName = fileId + ext;
    const newFilePath = path.join(path.dirname(oldFilePath), newFileName);

    const userId = req.user.id;
    const folderId = req.params.folderId || null;

    await fs.promises.rename(oldFilePath, newFilePath);

    const filePathForQuery = path
      .join("uploads", newFileName)
      .replace(/\\/g, "/");

    await db.queryInsertFile(
      fileId,
      originalname,
      newFileName,
      folderId,
      userId,
      fileSize,
      mimeType,
      filePathForQuery
    );

    res.status(200).json({
      status: "success",
      redirectUrl: newUrl,
    });
  } catch (err) {
    console.error(err); // Log real error to server/console

    res.status(500).json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
}
async function insertFolder(req, res) {
  try {
    const folderName = req.body.folder;
    const parentId = req.params.folderID || null;
    const userId = req.user.id;

    await db.queryInsertFolder(folderName, parentId, userId);

    if (parentId) {
      res.status(200).json({
        status: "success",
        redirectUrl: `/drive/${parentId}`,
      });
    } else {
      res.status(200).json({
        status: "success",
        redirectUrl: `/drive`,
      });
    }
  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: "error",
      message: "Internal server error. Please try again later.",
    });
  }
}

async function getAllNonFolderFiles() {
  try {
    const files = await db.queryGetNonFolderFiles();
    return files;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Could not fetch files.",
    });
  }
}

async function getAllParentFolders() {
  try {
    const folders = await db.queryGetAllParentFolders();

    return folders;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Could not fetch files.",
    });
  }
}

async function deleteNonFolderFileById(req, res) {
  const fileId = req.params.fileId;

  try {
    const rows = await db.queryGetNonFolderFileById(fileId);

    if (rows.length === 0) {
      console.error("File not found in database");
      return res.status(404).send("File not found");
    }

    const fileName = rows[0].internal_name; // e.g. "3fe12bff-b2d8-4b8e-bf7b-1a300cbb0a38.exe"

    const filePath = path.join(process.cwd(), "uploads", fileName);

    // Delete file from disk
    await fs.promises.unlink(filePath);
    console.log(`File ${filePath} has been successfully removed.`);

    await db.queryDeleteNonFolderFileById(fileId);

    res.redirect("/drive");
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Could not delete",
    });
  }
}

async function deleteFolderFileById(req, res) {
  const folderId = req.params.folderId;
  const fileId = req.params.fileId;

  try {
    const rows = await db.queryGetNonFolderFileById(fileId);
    const fileName = rows[0].internal_name; // e.g. "3fe12bff-b2d8-4b8e-bf7b-1a300cbb0a38.exe"
    const filePath = path.join(process.cwd(), "uploads", fileName);

    // Delete file from disk
    await fs.promises.unlink(filePath);
    console.log(`File ${filePath} has been successfully removed.`);

    await db.queryDeleteFolderFileById(folderId, fileId);

    res.status(500).json({
      status: "success",
      redirectUrl: "/drive",
    });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({
      status: "success",
      message: "Something went wrong. Could not delete",
    });
  }
}

async function getChildFoldersByParentId(req, res) {
  const folderId = req.params.folderID;
  const folders = await db.queryGetChildFoldersByParentId(folderId);
  return folders;
}

async function getChildFilesByParentId(req, res) {
  const folderId = req.params.folderID;
  const files = await db.queryGetChildFilesByParentId(folderId);
  return files;
}

async function getBreadcrumb(req, res) {
  const currFolderId = req.params.folderID;
  const breadcrumb = await db.queryGetBreadcrumb(currFolderId);

  return breadcrumb;
}

async function deleteFolder(req, res) {
  const folderId = req.params.folderId;
  const { rows } = await db.queryDeleteFolder(folderId);

  for (i = 0; i < rows.length; i++) {
    const fileName = rows[i].internal_name; // e.g. "3fe12bff-b2d8-4b8e-bf7b-1a300cbb0a38.exe"
    console.log("Filename: ", fileName);
    const filePath = path.join(process.cwd(), "uploads", fileName);
    console.log("File path: ", filePath);
    await fs.promises.unlink(filePath);
  }

  res.redirect("/drive");
}

async function renameFolder(req, res) {
  const newName = req.body.rename;
  const folderId = req.params.folderId;
  await db.queryRenameFolder(folderId, newName);
  res.redirect("/drive");
}

async function downloadFolder(req, res) {
  const zipName = `${req.params.folderId}.zip`;

  // Set headers BEFORE piping archive
  res.setHeader("Content-Disposition", `attachment; filename=${zipName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("Archive error:", err);
    res.status(500).send("Could not create ZIP.");
  });

  // Pipe archive data to response
  archive.pipe(res);

  // Fetch files for the folder
  const files = await db.queryGetChildFilesByParentId(req.params.folderId);

  // Add each file with absolute path (fix path issue here)
  files.forEach((file) => {
    // Build absolute path to file based on project root (adjust as needed)
    const absolutePath = path.join(process.cwd(), file.path);
    archive.file(absolutePath, { name: file.original_name });
  });

  // Finalize the archive (this sends the ZIP to client)
  archive.finalize();
}

async function downloadFile(req, res) {
  const folderId = req.params.folderId;
  const fileId = req.params.fileId;
  let file;

  try {
    if (folderId && fileId) {
      file = await db.queryGetFolderFileById(folderId, fileId);
    } else {
      file = await db.queryGetNonFolderFileById(fileId);
    }

    if (!file || file.length === 0) {
      return res.status(404).send("File not found");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file[0].original_name}`
    );
    res.setHeader("Content-Type", file[0].mime_type);

    const absolutePath = path.join(process.cwd(), file[0].path);
    res.download(absolutePath, file[0].original_name);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

function createShareableLink(fileId, req) {
  const protocol = req.protocol;
  const host = req.get("host");

  // This is a simple URL with the fileId directly in it
  const downloadUrl = `${protocol}://${host}/drive/download/${fileId}`;

  return downloadUrl;
}

async function getUserByInput(req, res) {
  const userInput = req.query.input;
  const user = await db.queryGetUserByInput(userInput);
  console.log(user);
  return user;
}

module.exports = {
  insertFile,
  getAllNonFolderFiles,
  insertFolder,
  getAllParentFolders,
  deleteNonFolderFileById,
  deleteFolderFileById,
  getChildFoldersByParentId,
  getChildFilesByParentId,
  getBreadcrumb,
  deleteFolder,
  renameFolder,
  downloadFolder,
  downloadFile,
  createShareableLink,
  getUserByInput,
};
