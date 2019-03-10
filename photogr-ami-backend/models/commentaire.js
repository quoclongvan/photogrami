const Joi = require('joi');
const mongoose = require('mongoose');

const schemaCommentaire = new mongoose.Schema({
  auteur: String,
  idPublication: String,
  commentaire: String,
  date: { type: Date, default: Date.now },
});

const Commentaire = mongoose.model('Commentaire', schemaCommentaire);

function validerCommentaire(commentaire){
  const schema = {
    idPublication: Joi.string().min(3).required(),
    commentaire: Joi.string().min(1).required(),
  }
  
  return Joi.validate(commentaire, schema);
}

exports.schemaCommentaire = schemaCommentaire;
exports.Commentaire = Commentaire;
exports.validerCommentaire = validerCommentaire;