const express = require('express');
const app = express();
const http = require('http');
let server = http.Server(app);

require('./startup/config')();
require('./startup/socket.js')(server);
require('./startup/db')();
require('./startup/routes')(app);

const port = process.env.PORT || 3000;
const serveur = server.listen(process.env.PORT || 3000, function() { console.log(`Écoute sur le port ${port}...`) });

module.exports = serveur;