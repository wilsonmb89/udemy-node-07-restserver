const express = require('express');
const app = express();
const Producto = require('../models/producto');
const { validateToken } = require('../middlewares/tokenValidation');
const validateRole = require('../middlewares/roleValidation');
const { removeFolder } = require('../utils/file-system');

app.get('/producto/buscar/:termino', [validateToken], (req, res) => {
  const termino = req.params.termino;
  const regex = new RegExp(termino, 'i');
  Producto.find({ nombre: regex })
  .populate('categoria', 'nombre descripcion')
  .populate('usuario', 'nombre email')
    .then(
      productosDB => {
        Producto.countDocuments()
        .then(
          totalCount => {
            return res.status(200).json({ ok: true, totalElements: totalCount, results: productosDB });
          }
        )
        .catch(err => res.status(500).json({ ok: false, error: err }));
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));;
});

app.get('/producto', [validateToken], (req, res) => {
  const page = Number(req.query.page) || 1;
  const resultsPerPage = Number(req.query.resultsPerPage) || 10;
  const skip = (page - 1) * resultsPerPage;
  Producto.find()
  .populate('categoria', 'nombre descripcion')
  .populate('usuario', 'nombre email')
  .sort('nombre')
  .skip(skip) // Registros a saltar
  .limit(resultsPerPage) // Solo obtiene los 10 primeros por defecto
    .then(
      productosDB => {
        Producto.countDocuments()
          .then(
            totalCount => {
              return res.status(200).json({ ok: true, resultsPerPage, page, totalElements: totalCount, results: productosDB });
            }
          )
          .catch(err => res.status(500).json({ ok: false, error: err }));
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.get('/producto/:id', [validateToken], (req, res) => {
  const id = req.params.id;
  Producto.findById(id)
    .then(
      async productoDB => {
        if (!productoDB) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró un producto con ese ID'});
        }
        await productoDB.populate('categoria').execPopulate();
        await productoDB.populate('usuario').execPopulate();
        return res.status(200).json({ ok: true, producto: productoDB });
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.post('/producto', [validateToken], (req, res) => {
  const body = req.body;
  Producto.create({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    img: body.img,
    disponible: body.disponible,
    categoria: body.categoria,
    usuario: body.usuario
  })
  .then(
    productoDB => {
      res.status(200).json({ ok: true, producto: productoDB });
    }
  )
  .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.put('/producto/:id', [validateToken], (req, res) => {
  const id = req.params.id;
  const body = req.body;
  Producto.findById(id)
    .then(
      productoDB => {
        if (!productoDB) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró un producto con ese ID'});
        }
        productoDB.nombre = body.nombre || productoDB.nombre;
        productoDB.precioUni = body.precioUni || productoDB.precioUni;
        productoDB.descripcion = body.descripcion || productoDB.descripcion;
        productoDB.disponible = body.disponible || productoDB.disponible;
        productoDB.img = body.img || productoDB.img;
        productoDB.categoria = body.categoria || productoDB.categoria;
        productoDB.usuario = body.usuario || productoDB.usuario;
        productoDB.save({ runValidations: true, new: true })
          .then(
            productoUpdateDB => {
              return res.status(200).json({ ok: true, producto: productoUpdateDB });
            }
          )
          .catch(err => res.status(500).json({ ok: false, error: err }));
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.delete('/producto/:id', [validateToken, validateRole], (req, res) => {
  const id = req.params.id;
  Producto.findByIdAndDelete(id)
    .then(
      deletedProducto => {
        if (!deletedProducto) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró un producto con ese ID'});
        }
        const deleteFolderResult = !!removeFolder('usuario', deletedUser._id);
        return res.status(200).json({ ok: true, producto: deletedProducto, deletedImgFolder: deleteFolderResult });
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

module.exports = app;