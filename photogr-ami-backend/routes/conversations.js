const authentication = require('../middleware/authentication');
const {Conversation} = require('../models/conversation');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Compte = mongoose.model('Compte');


// Retourne tous les conversations d'un utilisateur
router.get('/', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const conversation = await Conversation.find({listeUtilisateur: { $in: [nomUtilisateur] }}).sort([['dernierDate', -1]]).lean();

  let autreUtilisateur = [];
  for (let i = 0; i < conversation.length; i += 1) {
    if (conversation[i].listeUtilisateur.indexOf(nomUtilisateur) !== 0) {
      autreUtilisateur[i] = conversation[i].listeUtilisateur[0];
    } else {
      autreUtilisateur[i] = conversation[i].listeUtilisateur[1];
    }
    let compte = await Compte.findOne({ nomUtilisateur: autreUtilisateur[i]});
    conversation[i].nomConversation = compte.nomComplet;
  }
  res.send(conversation);
});

// Retourne une conversation spécifique de l'utilisateur
router.get('/:idConversation', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!mongoose.Types.ObjectId.isValid(req.params.idConversation)) return res.status(400).send("L'ID de la conversation est invalide");

  let conversation = await Conversation.findOne({ _id: req.params.idConversation}).lean();
  if (!conversation) return res.status(404).send("La conversation n'existe pas");

  let autreUtilisateur;
  if (conversation.listeUtilisateur.indexOf(nomUtilisateur) !== 0) {
    autreUtilisateur = conversation.listeUtilisateur[0];
  } else {
    autreUtilisateur = conversation.listeUtilisateur[1];
  }

  let compte = await Compte.findOne({ nomUtilisateur: autreUtilisateur});
  conversation.nomConversation = compte.nomComplet;
  conversation.autreUtilisateur = autreUtilisateur;

  return res.send(conversation);
});


// Créer une conversation avec un autre utilisateur
router.post('/:autreUtilisateur', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const utilisateurAjoute = req.params.autreUtilisateur.toLowerCase();

  const utilisateurExiste = await Compte.findOne({ nomUtilisateur: utilisateurAjoute });
  if (!utilisateurExiste) return res.status(404).send("L'utilisateur à ajouter n'existe pas");

  if (nomUtilisateur == utilisateurAjoute) return res.status(403).send('Vous ne pouvez pas faire une conversation avec vous-même');

  let conversationExiste = await Conversation.findOne({listeUtilisateur: { $all: [nomUtilisateur, utilisateurAjoute] }}).lean();

  if (!conversationExiste) {
    let conversation = new Conversation({
      listeUtilisateur: [nomUtilisateur, utilisateurAjoute],
      dernierMessage: `${nomUtilisateur} a créé une conversation avec ${utilisateurAjoute}.`,
      dernierUtilisateurEnvoi: 'Info',
    });
    conversation = await conversation.save();
  }
  
  let conversationModifie = await Conversation.findOne({listeUtilisateur: { $all: [nomUtilisateur, utilisateurAjoute] }}).lean();

  let compte = await Compte.findOne({ nomUtilisateur: utilisateurAjoute});

  conversationModifie.nomConversation = compte.nomComplet;
  res.send(conversationModifie);
});

exports.Conversation = Conversation;
module.exports = router;