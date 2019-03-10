const authentication = require('../middleware/authentication');
const bcrypt = require('bcrypt');
const {Compte, formattageNom, validerNouveauCompte, validerNouvelEmail, validerNouveauMDP, nomAleatoire} = require('../models/compte');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Téléversement de fichiers avec Multer
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './photo-profil/');
  },
  filename: function(req, file, cb) {
    cb(null, nomAleatoire() + '.png');
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter,
});

// Retourne tous les informations d'un utilisateur basé sur le token
router.get('/moi', authentication, async (req, res) => {
  let compte = await Compte.findById(req.compte._id).select(["-motDePasse","-__v","-mdpTemporaire"]);
  res.send(compte);
});


// Regarde si le nom d'utilisateur existe déjà, lors de la création du compte. Et pour afficher un profil
router.get('/recherche-nom-utilisateur/:nomUtilisateur', async (req, res, next) => {
  const compte = await Compte.findOne({ nomUtilisateur: req.params.nomUtilisateur.trim().toLowerCase()})
  .select(["-motDePasse","-_id","-__v","-email","-mdpTemporaire"]);
  if (!compte) return res.status(404).send(`Il n'y a pas de nom d'utilisateur avec le nom de ${req.params.nomUtilisateur.trim().toLowerCase()}`);
  res.send(compte);
});

// Regarde si l'email existe déjà, lors de la création du compte et modification d'email dans les réglages
router.get('/recherche-email/:email', async (req, res, next) => {
  const compte = await Compte.findOne({ email: req.params.email.trim().toLowerCase() });
  if (!compte) return res.status(200).send(`L'email peut être utilisé.`);
  return res.status(404).send(`Un compte avec l'adresse email ${req.params.email} existe déjà.`);
});

// Retourne tous les résultats de la recherche excluant l'utilisateur recherchant
router.get('/recherche/:input', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const compte = await Compte.find({ nomUtilisateur: { $nin: nomUtilisateur }});

  let input = req.params.input.toLowerCase();
  for (let i = compte.length - 1; i >= 0; i--) {
    if (!(compte[i].nomComplet.toLowerCase().includes(input) || compte[i].nomCompletInverse.toLowerCase().includes(input))) {
      if (!compte[i].nomUtilisateur.includes(input)) {
         compte.splice(i, 1);
      }
    }
  }
  res.send(compte);
});

// Créer un compte à l'utilisateur
router.post('/', async (req, res, next) => {
  const { error } = validerNouveauCompte(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.email = req.body.email.trim().toLowerCase();
  req.body.nomUtilisateur = req.body.nomUtilisateur.trim().toLowerCase();

  let emailCompte = await Compte.findOne({ email: req.body.email });
  if (emailCompte) return res.status(400).send(`Un compte avec l'adresse email ${req.body.email} existe déjà.`);

  let nomUtilisateurCompte = await Compte.findOne({ nomUtilisateur: req.body.nomUtilisateur });
  if (nomUtilisateurCompte) return res.status(400).send(`Un compte avec le nom d'utilisateur ${req.body.nomUtilisateur} existe déjà.`);

  if (req.body.sexe !== 'Homme' && req.body.sexe !== 'Femme' && req.body.sexe !== 'Autre') return res.status(400).send('Le sexe est invalide');

  const salt = await bcrypt.genSalt(10);
  req.body.motDePasse = await bcrypt.hash(req.body.motDePasse, salt);

  let compte = new Compte({
    prenom: formattageNom(req.body.prenom),
    nom: formattageNom(req.body.nom),
    email: req.body.email,
    nomUtilisateur: req.body.nomUtilisateur,
    sexe: req.body.sexe,
    motDePasse: req.body.motDePasse
  });
  compte = await compte.save();
  return res.status(200).send(`Le compte ${req.body.nomUtilisateur} à été créé avec succès`);
});

// Modifie la description/sexe/site de l'utilisateur
router.put('/profil/', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (req.body.sexe !== 'Homme' && req.body.sexe !== 'Femme' && req.body.sexe !== 'Autre') return res.status(400).send('Sexe invalide');

  const compte = await Compte.findOneAndUpdate({ nomUtilisateur: nomUtilisateur }, {
    description: req.body.description,
    sexe: req.body.sexe,
    site: req.body.site,
  }, {new: true}).select(["-motDePasse","-__v","-mdpTemporaire"]);
  res.send(compte);
});

// Modifie l'email du compte
router.put('/modifier-email/', authentication, async (req, res, next) => {
  const { error } = validerNouvelEmail(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const notreCompte = await Compte.findById(req.compte._id);
  const nomUtilisateur = notreCompte.nomUtilisateur;
  const notreEmail = notreCompte.email;

  req.body.email = req.body.email.trim().toLowerCase();
  req.body.emailConfirmation = req.body.emailConfirmation.trim().toLowerCase();

  if (req.body.email !== req.body.emailConfirmation) return res.status(400).send('Les nouveaux emails ne concordent pas');
  if (req.body.email === notreEmail) return res.status(400).send('Le nouvel adresse email doit être différent que votre adresse email actuel');

  let compteEmail = await Compte.findOne({ email: req.body.email });
  if (compteEmail) return res.status(400).send(`Un compte avec l'adresse email ${req.body.email} existe déjà.`);

  const compte = await Compte.findOneAndUpdate({ nomUtilisateur: nomUtilisateur }, {
    email: req.body.email,
  }, {new: true}).select(["-motDePasse","-__v","-mdpTemporaire"]);
  res.send(compte);
});

// Modifie le mot de passe du compte
router.put('/modifier-mot-de-passe/', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  const { error } = validerNouveauMDP(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.nouveauMDP !== req.body.nouveauMDPConfirmation) return res.status(400).send('Les nouveaux mots de passe ne concordent pas');

  const salt = await bcrypt.genSalt(10);
  let mdpDuCompte = await Compte.findOne({ nomUtilisateur: nomUtilisateur });
  if (await bcrypt.compare(req.body.mdpActuel, mdpDuCompte.motDePasse)) {
    req.body.nouveauMDP = await bcrypt.hash(req.body.nouveauMDP, salt);
    const compte = await Compte.findOneAndUpdate({ nomUtilisateur: nomUtilisateur }, {
      motDePasse: req.body.nouveauMDP,
    }, {new: true}).select(["-motDePasse","-__v","-mdpTemporaire"]);
    res.send(compte);
  }
  else
  {
    return res.status(404).send('Le mot de passe actuel est incorrect');
  }
});


// S'abonne ou se désabonne d'un utilisateur
router.put('/abonnement-utilisateur/:autreUtilisateur', authentication, async (req, res, next) => {
  const autreUtilisateur = req.params.autreUtilisateur.toLowerCase();

  const notreCompte = await Compte.findById(req.compte._id);
  const notreNomUtilisateur = notreCompte.nomUtilisateur;
  let notreListeAbonnement = notreCompte.listeAbonnement;

  if (autreUtilisateur === notreNomUtilisateur) return res.status(400).send("Vous ne pouvez pas vous abonner à vous-même");
  
  const siAutreNomUtilisateur = await Compte.findOne({ nomUtilisateur: autreUtilisateur });
  if (!siAutreNomUtilisateur) return res.status(404).send(`L'utilisateur ${autreUtilisateur} n'existe pas`);
  let autreListeAbonnes = siAutreNomUtilisateur.listeAbonnes;

  const siAbonnementUtilisateur  = await Compte.findOne({ nomUtilisateur: autreUtilisateur, listeAbonnes: {$in: notreNomUtilisateur}});
  if (!siAbonnementUtilisateur) {
    // Si on est pas abonné, on s'abonne (rajoute notre nom dans sa liste, et son nom dans notre liste)
    notreListeAbonnement.push(autreUtilisateur);
    autreListeAbonnes.push(notreNomUtilisateur);
  } else {
    for (let i = notreListeAbonnement.length - 1; i >= 0; i--) {
      if (notreListeAbonnement[i] === autreUtilisateur) {
        // Enlève son nom de notre liste
        notreListeAbonnement.splice(i, 1);
        break;
      };
    }
    for (let i = autreListeAbonnes.length - 1; i >= 0; i--) {
      if (autreListeAbonnes[i] === notreNomUtilisateur) {
        // Enlève notre nom de sa liste
        autreListeAbonnes.splice(i, 1);
        break;
      };
    }
  }

  const modifieNotreCompte = await Compte.findOneAndUpdate({ nomUtilisateur: notreNomUtilisateur }, {
    listeAbonnement: notreListeAbonnement,
  }, {new: true});
  const modifieAutreUtilisateur = await Compte.findOneAndUpdate({ nomUtilisateur: autreUtilisateur }, {
    listeAbonnes: autreListeAbonnes,
  }, {new: true});

  Promise.all([modifieNotreCompte, modifieAutreUtilisateur]).then(() => {
    if (siAbonnementUtilisateur) return res.status(200).send(`Vous vous êtes désabonnés de ${autreUtilisateur}`);
    if (!siAbonnementUtilisateur) return res.status(200).send(`Vous vous êtes abonnés à ${autreUtilisateur}`);
  });
});

// Change la photo de profil
router.put('/photo-de-profil/', authentication, upload.single('profilImage'), async (req, res, next) => {
  const notreCompte = await Compte.findById(req.compte._id);
  const nomUtilisateur = notreCompte.nomUtilisateur;
  const photoProfil = notreCompte.photoProfil;
  if (photoProfil !== 'photo-profil/photo-defaut.png') {
    fs.unlink(`${path.join(__dirname, '..')}/${photoProfil}`, (() => {}));
  }

  if (!req.file) return res.status(400).send("Il n'y a pas de photo de profil transmis en paramètre");

  const compte = await Compte.findOneAndUpdate({ nomUtilisateur: nomUtilisateur }, {
    photoProfil: req.file.path,
  }, {new: true}).select(["-motDePasse","-__v","-mdpTemporaire"]);
  res.send(compte);
});

// Supprime la photo de profil
router.put('/retirer-photo-profil/', authentication, async (req, res, next) => {
  const notreCompte = await Compte.findById(req.compte._id);
  const nomUtilisateur = notreCompte.nomUtilisateur;
  const photoProfil = notreCompte.photoProfil;
  if (photoProfil !== 'photo-profil/photo-defaut.png') {
    // Supprime la photo de notre backend pour éviter de garder les photos inutilisées
    fs.unlink(`${path.join(__dirname, '..')}/${photoProfil}`, (() => {}));
  } else {
    return res.status(404).send("Il n'y a pas de photo à retirer");
  }

  const compte = await Compte.findOneAndUpdate({ nomUtilisateur: nomUtilisateur }, {
    photoProfil: 'photo-profil/photo-defaut.png',
  }, {new: true}).select(["-motDePasse","-__v","-mdpTemporaire"]);
  res.send(compte);
});

exports.Compte = Compte;
module.exports = router;
