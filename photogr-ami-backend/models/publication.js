const mongoose = require('mongoose');

const schemaPublication = new mongoose.Schema({
  auteur: String,
  photo: String,
  description: { type: String, default: 'Aucune description pour cette publication' },
  listeUtilisateurAime: Array,
  date: { type: Date, default: Date.now },
});

const Publication = mongoose.model('Publication', schemaPublication);

exports.schemaPublication = schemaPublication;
exports.Publication = Publication;