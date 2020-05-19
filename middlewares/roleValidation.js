const validateRole = (req, res, next) => {
  if (!!req.usuario && req.usuario.role === 'ADMIN_ROLE') {
    next();
  } else {
    res.status(401).json({ ok: false, mensaje: 'No tiene los permisos necesarios para realizar esta operación'});
  }
};

module.exports = validateRole;