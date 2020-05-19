const jwt = require('jsonwebtoken');

const generateJWT = (usuarioJWT) => {
  return jwt.sign(
    {
      usuario: {
        _id: usuarioJWT._id,
        email: usuarioJWT.email,
        img: usuarioJWT.img,
        google: usuarioJWT.google,
        role: usuarioJWT.role,
        estado: usuarioJWT.estado,
      }
    },
    process.env.JWT_SEED,
    { 
      expiresIn: '1d' 
    }
  );
};

const validateJWT = (userToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(userToken, process.env.JWT_SEED, (error, decoded) => {
      if (!!error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = {
  generateJWT,
  validateJWT
};