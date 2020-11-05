require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Configuración global de rutas(controladores)
app.use(require('./controllers/index'));

mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(res => console.log('Base de datos online'))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
})