const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('../node_modules/joi');
const mongoose = require('../node_modules/mongoose'); 
const router = express.Router();
const Compte = mongoose.model('Compte');

router.post('/', async (req, res, next) => {
  const { error } = validerAuthentification(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let token;

  // Connexion soit par nom d'utilisateur ou email
  // Regarde si le nom d'utilisateur existe
  let compteNomUtilisateur = await Compte.findOne({ nomUtilisateur: req.body.identifiant.toLowerCase().trim() });
  if (!compteNomUtilisateur) { 
    // S'il n'existe pas, regarde si l'email existe
    let compteEmail = await Compte.findOne({ email: req.body.identifiant.toLowerCase().trim() });
    if (!compteEmail) {
      return res.status(400).send('Identifiant ou mot de passe invalide.');
    }
    else
    {
      // S'il existe, regarde si le mot de passe concorde avec l'email
      const mdpValide = await bcrypt.compare(req.body.motDePasse, compteEmail.motDePasse);
      if (!mdpValide) return res.status(400).send('Identifiant ou mot de passe invalide.');
      token = compteEmail.genereAuthToken();
    }
  }
  else {
    // S'il existe, regarde si le mot de passe concorde avec le nom d'utilisateur
    const mdpValide = await bcrypt.compare(req.body.motDePasse, compteNomUtilisateur.motDePasse);
    if (!mdpValide) return res.status(400).send('Identifiant ou mot de passe invalide.');
    token = compteNomUtilisateur.genereAuthToken();
  }
  return res.header('x-auth-token', token).send(token);
});

function validerAuthentification(req) {
  const schema = {
    identifiant: Joi.string().min(5).required(),
    motDePasse: Joi.string().min(7).required()
  }

  return Joi.validate(req, schema);
}

module.exports = router;