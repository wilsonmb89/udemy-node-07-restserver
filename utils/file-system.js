const fs = require('fs');
const path = require('path');

const saveFile = (fileType, id, file) => {
  try {
    const uploadsPath = path.resolve(__dirname, `../uploads`);
    const fileTypePath = path.resolve(__dirname, `../uploads/${fileType}`);
    const idPath = `${fileTypePath}/${id}`;
    createDir(uploadsPath);
    createDir(fileTypePath);
    createDir(idPath);
    clearIdDirectory(idPath);
    return writeFile(idPath, file);
  } catch (err) {
    console.error(err);
    return null;
  }
};

const createDir = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
};

const clearIdDirectory = (idPath) => {
  fs.readdirSync(idPath).forEach(
    file => {
      fs.unlinkSync(`${idPath}/${file}`);
    }
  );
};

const writeFile = (path, file) => {
  const fileName = file.name.split('.')[0];
  const fileExtension = file.name.split('.')[1];
  const fullFileName = `${fileName}_${new Date().getTime()}.${fileExtension}`;
  const fullPath = `${path}/${fullFileName}`;
  fs.writeFileSync(fullPath, file.data);
  return fullFileName;
}

const getFile = (fileType, id, fileName) => {
  const filePath = path.resolve(__dirname, `../uploads/${fileType}/${id}/${fileName}`);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found'); 
  }
  return filePath;
}

const removeFolder = (folderType, id) => {
  const folderToRemove = path.resolve(__dirname, `../uploads/${folderType}/${id}`);
  if (!fs.existsSync(folderToRemove)) {
    return false;
  }
  clearIdDirectory(folderToRemove);
  fs.rmdirSync(folderToRemove);
  return true;
}


module.exports = { saveFile, getFile, removeFolder };