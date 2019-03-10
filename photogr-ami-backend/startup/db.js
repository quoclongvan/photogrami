const mongoose = require('mongoose');
const config = require('config');
const CONNECTION_URI = config.get('db');

module.exports = function() { 
  mongoose.connect(CONNECTION_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }).then(() => console.log('Connecté à MongoDB...')).catch(err => console.error('Erreur de connexion à MongoDB...', err));
}