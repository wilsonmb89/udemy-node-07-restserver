const express = require('express');
const fileupload = require('express-fileupload');
const app = express();
const fileSystem = require('../utils/file-system');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const { validateToken, validateTokenUrl } = require('../middlewares/tokenValidation');

app.use(fileupload());

app.put('/files/upload/:fileType/:id', [validateToken], async (req, res) => {
  const fileType = req.params.fileType;
  const id = req.params.id;
  const files = req.files;
  if (!files || Object.keys(files).length === 0) {
    return res.status(404).json({ ok: false, mensaje: 'No se encontró ningun archivo'});
  }
  const inFile = files.inFile;
  if (!inFile || (!!inFile && inFile.name.indexOf('.') === -1)) {
    return res.status(400).json({ ok: false, mensaje: 'No se encontró ningun archivo o no tiene formato válido'});
  }
  const extension = inFile.name.split('.')[1];
  if (!extension.match(/jpg|png|jpeg|gif/)) {
    return res.status(400).json({ ok: false, mensaje: 'El archivo no es una imagen'});
  }
  const resultSaveImage = await saveImage(fileType, id, inFile)
    .catch(err => res.status(500).json({ ok: false, error: err}));
  if (!!resultSaveImage) {
    return res.status(200).json({ ok: true, savedImage: resultSaveImage});
  }
  return res.status(500).json({ ok: false, mensaje: 'Hubo un error guardando la imagen'});
});

app.get('/files/upload/:fileType/:id', [validateTokenUrl], async (req, res) => {
  const fileType = req.params.fileType;
  const id = req.params.id;
  let fileName = '';
  switch (fileType) {
    case 'usuario':
      fileName = await Usuario.findById(id).then(usuarioDB => usuarioDB.img || '').catch(err => '');
      break;
    case 'producto':
      fileName = await Producto.findById(id).then(productoDB=> productoDB.img || '').catch(err => '');
      break;
  }
  try {
    const pathFile = fileSystem.getFile(fileType, id, fileName);
    res.sendFile(pathFile);
  } catch (err) {
    res.status(404).json({ ok: false, mensaje: 'No se encontró la imagen' });
  }
});

const saveImage = async (fileType, id, image) => {
  let checkSaved = false;
  switch (fileType) {
    case 'usuario':
      checkSaved = await checkSavedUser(id).catch(err => false);
      break;
    case 'producto':
      checkSaved = await checkSavedProduct(id).catch(err => false);
      break;
  }
  if (checkSaved) {
    const savedFilePath = fileSystem.saveFile(fileType, id, image);
    const updateImageRs = await updateImagePath(fileType, id, savedFilePath).catch(err => null);
    if (updateImageRs) {
      return savedFilePath;
    }
    return null;
  }
  return null;
};

const checkSavedUser = (idUser) => {
  return new Promise((resolve, reject) => {
    Usuario.findById(idUser)
      .then(usuarioDB => {
        if (!usuarioDB) {
          return reject(false);
        }
        resolve(!!usuarioDB._id)
      })
      .catch(err => reject(false));
  });
};

const checkSavedProduct = (idProd) => {
  return new Promise(async (resolve, reject) => {
    await Producto.findById(idProd)
      .then(productoDB => {
        if (!productoDB) {
          return reject(false);
        }
        resolve(!!productoDB._id)
      })
      .catch(err => reject(false));
  });
};

const updateImagePath = (fileType, id, imgPath) => {
  return new Promise(async (resolve, reject) => {
    switch (fileType) {
      case 'usuario':
        await Usuario.findByIdAndUpdate(id, { img: imgPath}, { new: true, useFindAndModify: false })
          .then(usuarioDB => resolve(!!usuarioDB.img))
          .catch(err => reject(false));
      case 'producto':
        await Producto.findByIdAndUpdate(id, { img: imgPath }, { new: true, useFindAndModify: false })
          .then(productoDB => resolve(!!productoDB.img))
          .catch(err => reject(false));
    }
    reject(false);
  });
};

module.exports = app;