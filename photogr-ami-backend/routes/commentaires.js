const authentication = require('../middleware/authentication');
const express = require('express');
const {Commentaire, validerCommentaire} = require('../models/commentaire');
const mongoose = require('mongoose');
const router = express.Router();


const Compte = mongoose.model('Compte');
const Publication = mongoose.model('Publication');

// Retourne tout les commentaires d'une publication
router.get('/:idPublication', authentication, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.idPublication)) return res.status(400).send("L'ID de la publication est invalide");

  const idPublicationExiste = await Publication.findOne({ _id: req.params.idPublication});
  if (!idPublicationExiste) return res.status(404).send("Cette publication n'existe pas");
  
  const commentaire = await Commentaire.find({idPublication: req.params.idPublication}).sort([['date', -1]]);

  res.send(commentaire);
});

// Envoi un commentaire dans une publication
router.post('/', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const { error } = validerCommentaire(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(req.body.idPublication)) return res.status(400).send("L'ID de la publication est invalide");

  const idPublicationExiste = await Publication.findOne({ _id: req.body.idPublication});
  if (!idPublicationExiste) return res.status(404).send("Cette publication n'existe pas");

  let commentaire = new Commentaire({
    idPublication: req.body.idPublication,
    auteur: nomUtilisateur,
    commentaire: req.body.commentaire,
  });
  commentaire = await commentaire.save();
  res.send(commentaire);
});


// Supprime un commentaire dans une publication
router.delete('/:idCommentaire', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!mongoose.Types.ObjectId.isValid(req.params.idCommentaire)) return res.status(400).send("L'ID du commentaire est invalide");

  const commentaire = await Commentaire.findOne({ _id: req.params.idCommentaire });
  if (!commentaire) return res.status(404).send("Il n'y a pas de commentaire à retirer");

  let auteurPublication = await Publication.findOne({ _id: commentaire.idPublication});
  auteurPublication = auteurPublication.auteur;

  if (nomUtilisateur === commentaire.auteur || nomUtilisateur === auteurPublication) {
    let commentaireASupprimer = await Commentaire.findByIdAndDelete(req.params.idCommentaire);
    commentaireASupprimer = await commentaireASupprimer.save();
    if (commentaireASupprimer) return res.status(200).send('Le commentaire a été retiré');
  }
  return res.status(403).send('Vous ne pouvez pas retirer ce commentaire');
});

exports.Commentaire = Commentaire;
module.exports = router;