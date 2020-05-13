const bodyParser = require('body-parser');
const express = require('express');
const app = express();

/** Set body-parser */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

startServer = (port) =>{
  app.listen(port, () => {
    console.log(`Server succesfully start in ${port} port.`);
  });
};

app.get('/', (req, res) => {
  res.json({res: 'GET method OK'});
});

app.post('/', (req, res) => {
  const data = req.body;
  console.log(data);
  res.json({res: 'POST method OK', dataIn: data});
});

app.put('/', (req, res) => {
  res.json({res: 'PUT method OK'});
});

app.delete('/', (req, res) => {
  res.json({res: 'DELETE method OK'});
});

module.exports = { app, startServer };