const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const { generateJWT } = require('../utils/token');

app.post('/login', (req, res) => {
  const body = req.body;
  Usuario.findOne({ email: body.email })
  .then(
    userDB => {
      if (!userDB) {
        return res.status(404).json({ ok: false, mensaje: 'Usuario y/o contraseña incorrectos.'});
      }
      if (userDB.checkPassword(body.password)) {
        const jwt = generateJWT(userDB);
        return res.status(200).json({ ok: true, user: userDB, userToken: jwt });
      }
      return res.status(404).json({ ok: false, mensaje: 'Usuario y/o contraseña incorrectos.'});
    }
  )
  .catch(err => res.status(500).json(err));
});

module.exports = app;