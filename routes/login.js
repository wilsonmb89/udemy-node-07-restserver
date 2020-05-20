const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const { generateJWT } = require('../utils/token');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_SIGN_IN_CLIENT_ID);
const bcrypt = require('bcrypt');

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

const verify = async (token) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_SIGN_IN_CLIENT_ID
  });
  return ticket.getPayload();
}

app.post('/googleLogin', async (req, res) => {
  const token = req.body.idtoken;
  const tokenPayload = await verify(token)
    .catch(err => res.status(403).json({ ok: false, error: err }));
  const usuarioDB = await Usuario.findOne({ email: tokenPayload.email})
    .catch(err => res.status(500).json({ ok: false, error: err }));
  if (!!usuarioDB) {
    const jwt = generateJWT(usuarioDB);
    return res.status(200).json({ ok: true, user: usuarioDB, userToken: jwt });
  }
  const usuario = new Usuario({
    nombre: tokenPayload.name,
    email: tokenPayload.email,
    img: tokenPayload.picture,
    password: bcrypt.hashSync(tokenPayload.at_hash, 10),
    google: true
  });
  usuario.save((err, usuarioDB) => {
    if (!!err) {
      return res.status(500).json({ errddor: err });
    }
    const jwt = generateJWT(usuarioDB);
    return res.status(200).json({ ok: true, user: usuarioDB, userToken: jwt });
  });
});

module.exports = app;