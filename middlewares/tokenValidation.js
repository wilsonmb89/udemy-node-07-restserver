const { validateJWT } = require('../utils/token');

const validateToken = (req, res, next) => {
  const userToken = req.get('x-token') || '';
  validateJWT(userToken)
  .then(
    decoded => {
      req.usuario = decoded.usuario;
      next();
    }
  )
  .catch(error => res.status(401).json({ ok: false, mensaje: 'Token invalido', error}));
};

module.exports = validateToken;