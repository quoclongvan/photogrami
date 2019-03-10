const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
require('../node_modules/mongoose-type-email');

const schemaCompte = new mongoose.Schema({
  prenom: String,
  nom: String,
  nomUtilisateur: { type: String, unique: true },
  email: { type: mongoose.SchemaTypes.Email, unique: true },
  motDePasse: String,
  dateCreation: { type: Date, default: Date.now },
  description: String,
  photoProfil: { type: String, default: 'photo-profil/photo-defaut.png'},
  mdpTemporaire: { type: String, default: null },
  listeAbonnes: { type: Array, default: [] },
  listeAbonnement: { type: Array, default: [] },
  sexe: { type: String, enum: ['Homme', 'Femme', 'Autre']},
  site: { type: String, default: null },
});

// Génère un Token à l'authentication
schemaCompte.methods.genereAuthToken = function() {
  const token = jwt.sign({ _id: this._id}, config.get('jwtPrivateKey'));
  return token;
}

schemaCompte.virtual('nomComplet').get(function () {
  return this.prenom + ' ' + this.nom;
});

schemaCompte.virtual('nomCompletInverse').get(function () {
  return this.nom + ' ' + this.prenom;
});

function formattageNom(str) {
  str = str.trim();
  const splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

function validerNouveauCompte(compte){
  const schema = {
    prenom: Joi.string().min(2).max(35).required(),
    nom: Joi.string().min(2).max(35).required(),
    email: Joi.string().email().max(254).required(),
    nomUtilisateur: Joi.string().min(6).max(15).required().regex(/^(?!.*@).*$/),
    motDePasse: Joi.string().min(7).max(60).required(),
    sexe: Joi.string().required()
  }
  
  return Joi.validate(compte, schema);
}

function validerNouvelEmail(compte){
  const schema = {
    email: Joi.string().email().max(254).required(),
    emailConfirmation: Joi.string().email().max(254).required()
  }
  
  return Joi.validate(compte, schema);
}

function validerNouveauMDP(compte){
  const schema = {
    mdpActuel: Joi.string().min(7).max(60).required(),
    nouveauMDP: Joi.string().min(7).max(60).required(),
    nouveauMDPConfirmation: Joi.string().min(7).max(60).required()
  }
  
  return Joi.validate(compte, schema);
}

function nomAleatoire() {
  let fileName = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
    fileName += possible.charAt(Math.floor(Math.random() * possible.length));

  return fileName;
}

const Compte = mongoose.model('Compte', schemaCompte);

exports.schemaCompte = schemaCompte;
exports.Compte = Compte;
exports.formattageNom = formattageNom;
exports.validerNouvelEmail = validerNouvelEmail;
exports.validerNouveauMDP = validerNouveauMDP;
exports.validerNouveauCompte = validerNouveauCompte;
exports.validerNouvelEmail = validerNouvelEmail;
exports.validerNouveauMDP = validerNouveauMDP;
exports.nomAleatoire = nomAleatoire;