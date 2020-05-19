const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

/** Mongoose connection */
mongoose.connect(process.env.URL_MONGODB, 
                  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true},
                  (err) => {
                    if (!!err) {
                      throw err;
                    } else {
                      console.log('Base de datos ONLINE');
                    }
                  });

/** Set body-parser */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/** Set Controllers */
app.use(require('../routes/usuario'));
app.use(require('../routes/login'));

startServer = (port) =>{
  app.listen(port, () => {
    console.log(`Server succesfully start in ${port} port.`);
  });
};

module.exports = { startServer };