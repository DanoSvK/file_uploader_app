const pool = require("./pool");
const { v4: uuidv4 } = require("uuid");

const DEL_QUERY = `WITH RECURSIVE folder_tree AS (
  SELECT id FROM folders WHERE id = $1
  UNION ALL
  SELECT f.id
  FROM folders f
  INNER JOIN folder_tree ft ON f.parent_id = ft.id
)
SELECT id FROM folder_tree;`;

const BREADCRUMB = `
WITH RECURSIVE breadcrumb AS (
  SELECT id, name, parent_id, created_at
  FROM folders
  WHERE id = $1

  UNION ALL

  SELECT f.id, f.name, f.parent_id, f.created_at
  FROM folders f
  INNER JOIN breadcrumb b ON f.id = b.parent_id
)
SELECT * FROM breadcrumb ORDER BY created_at;
`;

// async function queryInsertFile(
//   fileId,
//   original_name,
//   internal_name,
//   folderId,
//   userId,
//   fileSize,
//   mimeType,
//   path
// ) {
//   try {
//     await pool.query(
//       "INSERT INTO files (id, original_name, internal_name, folder_id, user_id, size, mime_type, path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
//       [
//         fileId,
//         original_name,
//         internal_name,
//         folderId,
//         userId,
//         fileSize,
//         mimeType,
//         path,
//       ]
//     );
//     return fileId;
//   } catch (err) {
//     console.error("Database error in queryInsertFile:", err);
//     throw err;
//   }
// }

async function queryInsertFolder(folderName, parentId, userId) {
  try {
    const folderId = uuidv4();
    await pool.query(
      "INSERT INTO folders (id, name, parent_id, user_id) VALUES ($1, $2, $3, $4)",
      [folderId, folderName, parentId, userId]
    );
  } catch (err) {
    console.error("Database error in queryInsertFolder:", err);
    throw err;
  }
}

async function queryGetNonFolderFiles() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM files WHERE folder_id IS NULL"
    );
    return rows;
  } catch (err) {
    console.error("Database error in queryGetNonFolderFiles:", err);
  }
}

async function queryGetAllParentFolders() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM folders WHERE parent_id IS NULL"
    );
    return rows;
  } catch (err) {
    console.error("Database error in queryGetAllParentFolders:", err);
    throw err;
  }
}

async function queryDeleteNonFolderFileById(fileId) {
  try {
    await pool.query("DELETE FROM files WHERE id = $1", [fileId]);
  } catch (err) {
    console.error("Database error in queryDeleteNonFolderFileById:", err);
    throw err;
  }
}

async function queryDeleteFolderFileById(folderId, fileId) {
  try {
    await pool.query("DELETE FROM files WHERE id = $1 AND folder_id = $2", [
      fileId,
      folderId,
    ]);
  } catch (err) {
    console.error("Database error in queryDeleteFolderFileById:", err);
    throw err;
  }
}

async function queryGetChildFoldersByParentId(folderId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM folders WHERE parent_id = $1",
      [folderId]
    );
    return rows;
  } catch (err) {
    console.error("Database error in queryGetChildFoldersByParentId:", err);
    throw err;
  }
}

async function queryGetChildFilesByParentId(folderId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM files WHERE folder_id = $1",
      [folderId]
    );
    return rows;
  } catch (err) {
    console.log("Database error in queryGetChildFilesByParentId:", err);
    throw err;
  }
}

async function queryGetBreadcrumb(currFolderId) {
  try {
    const { rows } = await pool.query(BREADCRUMB, [currFolderId]);
    return rows;
  } catch (err) {
    console.log("Database error in queryGetBreadcrumb:", err);
    throw err;
  }
}

async function queryDeleteFolder(folderId) {
  try {
    const { rows } = await pool.query(DEL_QUERY, [folderId]);
    const folderIds = rows.map((row) => row.id);
    const files = await pool.query(
      "SELECT * FROM files WHERE folder_id = ANY($1::uuid[])",
      [folderIds]
    );
    await pool.query("DELETE FROM folders WHERE id = ANY($1::uuid[])", [
      folderIds,
    ]);
    return files;
  } catch (err) {
    console.log("Database error in queryDeleteFolder:", err);
    throw err;
  }
}

async function queryGetFilenameById(fileId) {
  try {
    const { rows } = await pool.query(
      "SELECT original_name FROM files WHERE id = $1",
      [fileId]
    );
    return rows;
  } catch (err) {
    console.log("Database error in queryGetFilenameById:", err);
    throw err;
  }
}

async function queryRenameFolder(folderId, newName) {
  try {
    await pool.query("UPDATE folders SET name = $2 WHERE id = $1", [
      folderId,
      newName,
    ]);
  } catch (err) {
    console.log("Database error in queryRenameFolder:", err);
    throw err;
  }
}

async function queryGetNonFolderFileById(fileId) {
  try {
    const { rows } = await pool.query("SELECT * FROM files WHERE id = $1", [
      fileId,
    ]);
    return rows;
  } catch (err) {
    console.log("Database error in queryGetNonFolderFileById:", err);
    throw err;
  }
}

async function queryGetFolderFileById(folderId, fileId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM files WHERE id = $1 AND folder_id = $2",
      [fileId, folderId]
    );
    return rows;
  } catch (err) {
    console.log("Database error in queryGetFolderFileById:", err);
    throw err;
  }
}

async function queryGetUserByInput(input) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [input]
    );
    return rows;
  } catch (err) {
    console.log("Database error in queryGetUserByInput:", err);
    throw err;
  }
}

module.exports = {
  // queryInsertFile,
  queryGetNonFolderFiles,
  queryInsertFolder,
  queryGetAllParentFolders,
  queryDeleteNonFolderFileById,
  queryDeleteFolderFileById,
  queryGetChildFoldersByParentId,
  queryGetChildFilesByParentId,
  queryGetBreadcrumb,
  queryDeleteFolder,
  queryGetFilenameById,
  queryRenameFolder,
  queryGetNonFolderFileById,
  queryGetFolderFileById,
  queryGetUserByInput,
};
