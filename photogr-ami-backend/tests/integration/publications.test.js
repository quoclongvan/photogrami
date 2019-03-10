const request = require('supertest');
const {Compte} = require('../../models/compte');
const {Publication} = require('../../models/publication');
const mongoose = require('mongoose');
const path = require('path');

let serveur;
let token;
let compteUnId;
let publicationUnId;
let nomUtilisateur;
beforeEach(async () => {
  serveur = require('../../index');
  compteUnId = mongoose.Types.ObjectId();
  publicationUnId = mongoose.Types.ObjectId();
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
  let publicationUn = new Publication({
    _id: publicationUnId,
    auteur: 'utilisateurtest1',
    photo: 'photo-publication/abcdefghijklmnop.png',
    description: 'Une description',
    listeUtilisateurAime: ['utilisateurtest1', 'utilisateurtest2']
  });
  await publicationUn.save();
  let publicationDeux = new Publication({
    auteur: 'utilisateurtest2',
    photo: 'photo-publication/abcdefghijklmnoz.png',
    description: 'Deux description'
  });
  await publicationDeux.save();

  nomUtilisateur = await Compte.findById(compteUnId).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;
});

afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
  await Publication.remove({});
});

describe('/api/publication', () => {
  describe('GET /', () => {
    const exec = async (params, input) => {
      return await request(serveur)
        .get(`/api/publication/${params}/${input}`)
        .set('x-auth-token', token);
    }
    describe('GET /populaire', () => {
      it(`devrait retourner un maximum de 10 publications, en ordre de popularité`, async () => {
        const res = await exec('populaire', '1');
        
        expect(res.body.length).toBe(2);
        expect(res.body[0].listeUtilisateurAime.length).toBe(2);
        expect(res.body[1].listeUtilisateurAime.length).toBe(0);
        expect(res.status).toBe(200);
      });
    });
    describe('GET /utilisateur/:utilisateur', () => {
      it(`devrait retourner toutes les publications d'un utilisateur en ordre du plus récent`, async () => {
        const res = await exec('utilisateur', 'utilisateurtest1');

        expect(res.body.length).toBe(1);
        expect(res.body[0].listeUtilisateurAime.length).toBe(2);
        expect(res.status).toBe(200);
      });
    });
    describe('GET /abonnement', () => {
      it(`devrait retourner un maximum de 10 publications de ses abonnements ainsi que lui-même`, async () => {
        const res = await exec('abonnement', '1');

        expect(res.body.length).toBe(2);
        expect(res.body[0].listeUtilisateurAime.length).toBe(0);
        expect(res.status).toBe(200);
      });
    });
    describe('GET /favoris/:utilisateur', () => {
      it(`devrait retourner toutes les publications favoris d'un utilisateur`, async () => {
        const res = await exec('favoris', 'utilisateurtest2');

        expect(res.body.length).toBe(1);
        expect(res.body[0].listeUtilisateurAime.length).toBe(2);
        expect(res.status).toBe(200);
      });
    });
  });
  describe('POST /publication', () => {
    const exec = async (photoFichier, texteDescription) => {
      return await request(serveur)
        .post('/api/publication/')
        .set('x-auth-token', token)
        .attach('publicationImage', photoFichier)
        .field('description', texteDescription);
    }
    it(`devrait changer la photo de profil de l'utilisateur`, async () => {
      const res = await exec(path.join(__dirname, '../../photo-profil/photo-defaut.png'), 'nouvelle publication test');

      expect(res.status).toBe(200); 
    });
    it(`devrait retourner erreur 400 si l'utilisateur ne transmet pas une photo`, async () => {
      const res = await exec('', '');

      expect(res.status).toBe(400); 
    });
  });
  describe('PUT /change-status/:idPublication', () => {
    const exec = async (idPublication) => {
      return await request(serveur)
        .put(`/api/publication/change-status/${idPublication}`)
        .set('x-auth-token', token)
        .send({});
    }
    it(`devrait enlever/ajouter la mention j'aime d'une publication`, async () => {
      const res = await exec(publicationUnId);

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 400 si id publication de type invalide (doit être ObjectID)`, async () => {
      const res = await exec('a');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 404 si id publication de type valide mais n'existe pas`, async () => {
      const res = await exec('1c6304057688880d9227c24b');

      expect(res.status).toBe(404);
    });
  });
  describe('DELETE /:idPublication', () => {
    const exec = async (idPublication) => {
      return await request(serveur)
        .delete(`/api/publication/${idPublication}`)
        .set('x-auth-token', token)
        .send({});
    }
    it(`devrait supprimer la publication`, async () => {
      const res = await exec(publicationUnId);

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 400 si id publication de type invalide (doit être ObjectID)`, async () => {
      const res = await exec('a');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 404 si id publication de type valide mais n'existe pas`, async () => {
      const res = await exec('1c6304057688880d9227c24b');

      expect(res.status).toBe(404);
    });
  });
});