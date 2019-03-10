const authentication = require('../middleware/authentication');
const express = require('express');
const {Publication} = require('../models/publication');
const {schemaCommentaire} = require('../models/commentaire');
const {nomAleatoire} = require('../models/compte');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// https://www.youtube.com/watch?v=srPXMt1Q0nY
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
    cb(null, './photo-publication/');
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

const Commentaire = mongoose.model('Commentaire', schemaCommentaire);
const Compte = mongoose.model('Compte');

// 10 publications par page en ordre de popularité
router.get('/populaire/:page', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  // Après multiple version qui s'est avéré incorrect:
  // Nécessaire pour bien filtrer en ordre du nombre de j'aime, mais ensuite filtrer en date du plus récent
  // https://stackoverflow.com/questions/32063941/how-to-sort-documents-based-on-length-of-an-array-field
  let publicationPopulaire = await Publication.aggregate([
      { "$project": 
        {
          "auteur": 1,
          "photo": 1,
          "description": 1,
          "listeUtilisateurAime": 1,
          "date": 1,
          "nombreAime": { "$size": "$listeUtilisateurAime"
        }
      }
    },
    { "$sort": { "nombreAime": -1, "date": -1 } },
    { "$skip": (req.params.page - 1) * 10 },
    { "$limit": 10 }
  ]);

  res.send(publicationPopulaire);
});

// Tous les publications d'un utilisateur
router.get('/utilisateur/:utilisateur', authentication, async (req, res, next) => {
  const utilisateurExiste = await Compte.findOne({nomUtilisateur: req.params.utilisateur});
  if (!utilisateurExiste) return res.status(404).send(`L'utilisateur ${req.params.utilisateur} n'existe pas`);

  const publicationUtilisateur = await Publication.find({auteur: req.params.utilisateur}).sort([['date', -1]]);

  res.send(publicationUtilisateur);
});

// 10 publications suivis par page
router.get('/abonnement/:page', authentication, async (req, res, next) => {
  const notreCompte = await Compte.findById(req.compte._id);
  const nomUtilisateur = notreCompte.nomUtilisateur;
  const listeAbonnement = notreCompte.listeAbonnement;

  const publicationUtilisateur = await Publication.find({$or:[{auteur: listeAbonnement}, {auteur: nomUtilisateur}]})
  .sort([['date', -1]])
  .skip((req.params.page - 1) * 10)
  .limit(10);

  res.send(publicationUtilisateur);
});

// Tous les publications favoris d'un utilisateur en ordre de date du plus récent
router.get('/favoris/:utilisateur', authentication, async (req, res, next) => {
  const utilisateurExiste = await Compte.findOne({nomUtilisateur: req.params.utilisateur});
  if (!utilisateurExiste) return res.status(404).send(`L'utilisateur ${req.params.utilisateur} n'existe pas`);

  const publicationFavorisUtilisateur = await Publication.find({listeUtilisateurAime: { $in: [req.params.utilisateur] }}).sort([['date', -1]]);

  res.send(publicationFavorisUtilisateur);
});

// Créer une nouvelle publication
router.post('/', authentication, upload.single('publicationImage'), async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!req.file) return res.status(400).send("Il n'y a pas de photo transmis en paramètre pour la publication");

  let publication = new Publication({
    auteur: nomUtilisateur,
    photo: req.file.path,
    description: req.body.description,
  });
  publication = await publication.save();
  res.send(publication);
});


// Ajoute/retire une publication de ses favoris (aime)
router.put('/change-status/:idPublication', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!mongoose.Types.ObjectId.isValid(req.params.idPublication)) return res.status(400).send("L'ID de la publication est invalide");
  let publication = await Publication.findOne({ _id: req.params.idPublication});
  if (!publication) return res.status(404).send("La publication n'existe pas");
  const auteur = publication.auteur;
  publication = publication.listeUtilisateurAime;

  let siUtilisateurAimeStatus  = await Publication.findOne({ _id: req.params.idPublication, listeUtilisateurAime: {$in: nomUtilisateur} });

  if (!siUtilisateurAimeStatus) {
    // Ajoute le nom d'utilisateur dans la liste
    publication.push(nomUtilisateur);
  } else {
    for (let i = publication.length - 1; i >= 0; i--) {
      if (publication[i] === nomUtilisateur) {
        // Enlève le nom d'utilisateur de la liste
        publication.splice(i, 1);
        break;
      };
    }
  }

  const modifieStatusAime = await Publication.findOneAndUpdate({ _id: req.params.idPublication}, {
    listeUtilisateurAime: publication,
  }, {new: true});

  Promise.resolve(modifieStatusAime).then(() => {
    if (siUtilisateurAimeStatus) return res.status(200).send(`Vous avez retiré un j'aime à la publication de ${auteur}`);
    if (!siUtilisateurAimeStatus) return res.status(200).send(`Vous avez ajouté un j'aime à la publication de ${auteur}`);
  });
});


// Supprime une publication
router.delete('/:idPublication', authentication, async (req, res, next) => {
  let nomUtilisateur = await Compte.findById(req.compte._id).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;

  if (!mongoose.Types.ObjectId.isValid(req.params.idPublication)) return res.status(400).send("L'ID de la publication est invalide");

  const publicationUtilisateur = await Publication.findOne({ _id: req.params.idPublication, auteur: nomUtilisateur});
  if (!publicationUtilisateur) return res.status(404).send("Il n'y a pas de publication à retirer");
  
  // Supprime la photo de notre backend pour éviter de garder les photos inutilisées
  fs.unlink(`${path.join(__dirname, '..')}/${publicationUtilisateur.photo}`, (() => {}));

  let commentairesPublication = await Commentaire.deleteMany({idPublication: req.params.idPublication});

  let publicationASupprimer = await Publication.findByIdAndDelete(req.params.idPublication);
  publicationASupprimer = await publicationASupprimer.save();
  Promise.all([commentairesPublication, publicationASupprimer]).then(() => {
    return res.status(200).send('La publication ainsi que les commentaires ont été supprimé');
  });
});

exports.Publication = Publication;
module.exports = router;