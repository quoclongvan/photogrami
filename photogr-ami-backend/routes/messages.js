const authentication = require('../middleware/authentication');
const express = require('express');
const {Message, validerMessage} = require('../models/message');
const mongoose = require('mongoose');
const router = express.Router();
const Compte = mongoose.model('Compte');
const Conversation = mongoose.model('Conversation');


// Retourne tous les messages d'une conversation
router.get('/:idConversation', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!mongoose.Types.ObjectId.isValid(req.params.idConversation)) return res.status(400).send("L'ID de la conversation est invalide");

  const utilisateurDansConversation = await Conversation.findOne({ _id: req.params.idConversation, listeUtilisateur: {$in: nomUtilisateur}});
  if (!utilisateurDansConversation) return res.status(403).send("Cette conversation n'existe pas ou vous n'y avez pas accès");
  
  const message = await Message.find({idConversation: req.params.idConversation});

  res.send(message);
});

// Envoi un message dans une conversation
router.post('/', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const { error } = validerMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  if (!mongoose.Types.ObjectId.isValid(req.body.idConversation)) return res.status(400).send("L'ID de la conversation est invalide");

  const utilisateurDansConversation = await Conversation.findOne({ _id: req.body.idConversation, listeUtilisateur: {$in: nomUtilisateur}});
  if (!utilisateurDansConversation) return res.status(403).send("Cette conversation n'existe pas ou vous n'y avez pas accès");


  let message = new Message({
    idConversation: req.body.idConversation,
    auteur: nomUtilisateur,
    message: req.body.message,
  });
  message = await message.save();

  const conversation = await Conversation.findOneAndUpdate({ _id: req.body.idConversation }, {
    dernierMessage: req.body.message,
    dernierUtilisateurEnvoi: nomUtilisateur,
    dernierDate: Date.now(),
  }, {new: true});

  Promise.all([message, conversation]).then((updateMsgEtConv) => {
    return res.status(200).json(updateMsgEtConv);
  }).catch((err) => {
    return res.status(400).json(err);
  });
});

exports.Message = Message;
module.exports = router;