const express = require('express');
const app = express();
const Categoria = require('../models/categoria');
const { validateToken } = require('../middlewares/tokenValidation');
const validateRole = require('../middlewares/roleValidation');

app.get('/categoria', [validateToken], (req, res) => {
  Categoria.find()
    .populate('usuario', 'nombre email')
    .sort({nombre: 1})
    .then(
      categoriasDB => {
        return res.status(200).json({ ok: true, results: categoriasDB});
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.get('/categoria/:id', [validateToken],(req, res) => {
  const id = req.params.id;
  Categoria.findById(id)
    .then(
      async categoriaDB => {
        if (!categoriaDB) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró una categoria con ese ID'});
        }
        await categoriaDB.populate('usuario').execPopulate();
        return res.status(200).json({ ok: true, categoria: categoriaDB });
      }
    )
    .catch( err => res.status(500).json({ ok: false, error: err }));
});

app.post('/categoria', [validateToken], (req, res) => {
  const body = req.body;
  Categoria.create({
    nombre: body.nombre,
    descripcion: body.descripcion,
    usuario: body.usuario
  })
  .then(
    categoriaDB => {
      res.status(200).json({ ok: true, categoria: categoriaDB });
    }
  )
  .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.put('/categoria/:id', [validateToken], (req, res) => {
  const id = req.params.id;
  const body = req.body;
  Categoria.findById(id)
    .then(
      categoriaDB => {
        if (!categoriaDB) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró una categoria con ese ID' });
        }
        categoriaDB.nombre = body.nombre || categoriaDB.nombre;
        categoriaDB.descripcion = body.descripcion || categoriaDB.descripcion;
        categoriaDB.usuario = body.usuario || categoriaDB.usuario;
        categoriaDB.save({ runValidators: true, new: true })
          .then(
            categoriaUpdateDB => {
              return res.status(200).json({ ok: true, categoria: categoriaUpdateDB });
            } 
          )
          .catch(err => res.status(500).json({ ok: false, error: err }));
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

app.delete('/categoria/:id', [validateToken, validateRole], (req, res) => {
  const id = req.params.id;
  Categoria.findByIdAndDelete(id)
    .then(
      categoriaDelete => {
        if (!categoriaDelete) {
          return res.status(404).json({ ok: false, mensaje: 'No se encontró una categoria con ese ID' });
        }
        return res.status(200).json({ ok: true, categoria: categoriaDelete });
      }
    )
    .catch(err => res.status(500).json({ ok: false, error: err }));
});

module.exports = app;
