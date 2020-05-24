const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const { validateToken } = require('../middlewares/tokenValidation');
const validateRole = require('../middlewares/roleValidation');
const { removeFolder } = require('../utils/file-system');

app.get('/usuario', [validateToken], (req, res) => {
  const usersStatus = (req.query.usersStatus !== null && req.query.usersStatus !== undefined) ? req.query.usersStatus : true;
  const page = Number(req.query.page) || 1;
  const resultsPerPage = Number(req.query.resultsPerPage) || 10;
  const skip = (page - 1) * resultsPerPage;
  Usuario.find({ estado: usersStatus }, 'nombre email role westado google img')
    .sort({ _id: 1 }) // Ordenamiento por _id de forma descendente
    .skip(skip) // Registros a saltar
    .limit(resultsPerPage) // Solo obtiene los 10 primeros
    .then(
      usersResults => {
        Usuario.countDocuments({ estado: usersStatus })
        .then(
          totalCount => {
            res.json({ ok: true, resultsPerPage, page, totalElements: totalCount, users: usersResults });
          }
        )
        .catch(error => { res.status(500).json({ ok: false, error }); });
      }
    )
    .catch(error => { res.status(500).json({ ok: false, error }); });
});

app.post('/usuario', [validateToken, validateRole], (req, res) => {
  const body = req.body;
  const usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    google: body.google,
    role: body.role,
    estado: body.estado
  });
  usuario.save((err, usuarioDB) => {
    if (!!err) {
      return res.status(400).json(err);
    }
    res.status(200).json({ok: true, createdUser: usuarioDB});
  });
});

app.put('/usuario/:id', [validateToken, validateRole], (req, res) => {
  const id = req.params.id;
  const body = req.body;
  Usuario.findById(id)
    .then(
      userDB => {
        if (!userDB) {
          return res.status(404).json({ ok: false, error: { mensaje: 'No se encontró un usuario para actualizar' }});
        }
        userDB.nombre = !!body.nombre ? body.nombre : userDB.nombre;
        userDB.email = !!body.email ? body.email : userDB.email;
        userDB.img = !!body.img ? body.img : userDB.img;
        userDB.role = !!body.role ? body.role : userDB.role;
        userDB.estado = (body.estado !== null && body.estado !== undefined) ? body.estado : userDB.estado;
        userDB.save({ runValidators: true })
        .then(
          userUpdated => {
            if (!userUpdated) {
              return res.status(404).json({ ok: false, error: { mensaje: 'No se encontró un usuario para actualizar' }});
            }
            return res.status(200).json({ ok: true, updatedUser: userUpdated});
          }
        )
        .catch(err => res.status(500).json(err));
      }
    )
    .catch(err => res.status(500).json(err));
});

app.delete('/usuario/:id', [validateToken, validateRole], (req, res) => {
  const id = req.params.id;
  Usuario.findByIdAndDelete(id)
  .then(
    deletedUser => {
      if (!deletedUser) {
        return res.status(404).json({ ok: false, mensaje: 'No se encontró usuario para eliminar' });
      }
      const deleteFolderResult = !!removeFolder('usuario', deletedUser._id);
      return res.status(200).json({ ok: true, deletedUser, deletedImgFolder: deleteFolderResult});
    }
  )
  .catch(err => res.status(500).json(err));
});

module.exports = app;