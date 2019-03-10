const request = require('supertest');
const {Compte} = require('../../models/compte');
const {Publication} = require('../../models/publication');
const {Commentaire} = require('../../models/commentaire');
const mongoose = require('mongoose');

let serveur;
let token;
let compteUnId;
let publicationUnId;
let commentaireUnId;
let nomUtilisateur;
let tokenDeux;
beforeEach(async () => {
  serveur = require('../../index');
  compteUnId = mongoose.Types.ObjectId();
  publicationUnId = mongoose.Types.ObjectId();
  commentaireUnId = mongoose.Types.ObjectId();
  let compteUn = new Compte({
    _id: compteUnId,
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test1@gmail.com',
    nomUtilisateur: 'utilisateurtest1',
    sexe: 'Homme',
    motDePasse: '$2b$10$RjJ.PTVVsV9jwt1n5HSO6O2eahAAZpahjKnQQ4S4yPEYG4/V5jB/C', // Mot de passe 'motdepasse' hashé.
    listeAbonnement: ['utilisateurtest2']
  });
  await compteUn.save();
  let compteDeux = new Compte({
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test2@gmail.com',
    nomUtilisateur: 'utilisateurtest2',
    sexe: 'Homme',
    motDePasse: '$2b$10$RjJ.PTVVsV9jwt1n5HSO6O2eahAAZpahjKnQQ4S4yPEYG4/V5jB/C', // Mot de passe 'motdepasse' hashé.
    listeAbonnes: ['utilisateurtest1']
  });
  await compteDeux.save();
  token = compteUn.genereAuthToken();
  tokenDeux = compteDeux.genereAuthToken();
  let publicationUn = new Publication({
    _id: publicationUnId,
    auteur: 'utilisateurtest1',
    photo: 'photo-publication/abcdefghijklmnop.png',
    description: 'Une description',
    listeUtilisateurAime: ['utilisateurtest1', 'utilisateurtest2']
  });
  await publicationUn.save();
  let commentaireUn = new Commentaire({
    _id: commentaireUnId,
    idPublication: publicationUnId,
    auteur: 'utilisateurtest1',
    commentaire: 'Commentaire test 1'
  })
  await commentaireUn.save();

  nomUtilisateur = await Compte.findById(compteUnId).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;
});

afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
  await Publication.remove({});
  await Commentaire.remove({});
});

describe('/api/commentaire', () => {
  describe('GET /:idPublication', () => {
    const exec = async (idPublication) => {
      return await request(serveur)
        .get(`/api/commentaire/${idPublication}`)
        .set('x-auth-token', token);
    }
    it(`devrait retourner les commentaires d'une publication`, async () => {
      const res = await exec(publicationUnId);
      
      expect(res.body.length).toBe(1);
      expect(res.status).toBe(200);
    });
    it('devrait retourner erreur 400 si id publication de type invalide (doit être ObjectID)', async () => {
      const res = await exec('a');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 404 si id publication n'existe pas`, async () => {
      const res = await exec('1c6304057688880d9227c24b');

      expect(res.status).toBe(404);
    });
  });
  describe('POST /', () => {
    const exec = async (id, commentaire) => {
      return await request(serveur)
        .post('/api/commentaire/')
        .set('x-auth-token', token)
        .send({
          idPublication: id,
          commentaire: commentaire
        });
    }
    it('devrait créer et retourner un commentaire', async () => {
      const res = await exec(publicationUnId, 'commentaire test 2');

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 400 si le commentaire est vide`, async () => {
      const res = await exec(publicationUnId, '');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 400 si id publication de type invalide (doit être ObjectID)`, async () => {
      const res = await exec('asdasd', 'commentaire test 3');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 404 si la publication n'existe pas`, async () => {
      const res = await exec('1c6304057688880d9227c24b', 'commentaire test 4');

      expect(res.status).toBe(404);
    });
  });
  describe('DELETE /', () => {
    const exec = async (token, idCommentaire) => {
      return await request(serveur)
        .delete(`/api/commentaire/${idCommentaire}`)
        .set('x-auth-token', token);
    }
    it('devrait supprimer un commentaire', async () => {
      const res = await exec(token, commentaireUnId);

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 403 si le commentaire existe mais l'utilisateur n'a pas l'autorisation de le retirer`, async () => {
      const res = await exec(tokenDeux, commentaireUnId);

      expect(res.status).toBe(403);
    });
    it(`devrait retourner erreur 400 si id commentaire de type invalide (doit être ObjectID)`, async () => {
      const res = await exec(token, 'a');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 404 si le commentaire n'existe pas`, async () => {
      const res = await exec(token, '1c6304057688880d9227c24b');

      expect(res.status).toBe(404);
    });
  });
});