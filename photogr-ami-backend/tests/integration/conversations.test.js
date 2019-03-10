const request = require('supertest');
const {Conversation} = require('../../models/conversation');
const {Compte} = require('../../models/compte');
const mongoose = require('mongoose');

let serveur;
let token;
let compteUnId;
let conversationUnId;
let nomUtilisateur;
beforeEach(async () => {
  serveur = require('../../index');
  compteUnId = mongoose.Types.ObjectId();
  conversationUnId = mongoose.Types.ObjectId();
  let compteUn = new Compte({
    _id: compteUnId,
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test1@gmail.com',
    nomUtilisateur: 'utilisateurtest1',
    sexe: 'Homme',
    motDePasse: 'motdepasse'
  });
  await compteUn.save();
  token = compteUn.genereAuthToken();
  let compteDeux = new Compte({
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test2@gmail.com',
    nomUtilisateur: 'utilisateurtest2',
    sexe: 'Homme',
    motDePasse: 'motdepasse'
  });
  await compteDeux.save();
  let compteTrois = new Compte({
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test3@gmail.com',
    nomUtilisateur: 'utilisateurtest3',
    sexe: 'Homme',
    motDePasse: 'motdepasse'
  });
  await compteTrois.save();
  let conversationUn = new Conversation({
    _id: conversationUnId,
    listeUtilisateur: ['utilisateurtest1', 'utilisateurtest2'],
    dernierMessage: 'test',
    dernierUtilisateurEnvoi: 'utilisteurtest1'
  });
  await conversationUn.save();
  let conversationDeux = new Conversation({
    listeUtilisateur: ['utilisateurtest2', 'utilisateurtest3'],
    dernierMessage: 'test',
    dernierUtilisateurEnvoi: 'utilisateurtest2'
  });
  await conversationDeux.save();

  nomUtilisateur = await Compte.findById(compteUnId).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;
});

afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
  await Conversation.remove({});
});


describe('/api/conversation', () => {
  describe('GET', () => {
    const exec = async (idConv) => {
      return await request(serveur)
        .get(`/api/conversation/${idConv}`)
        .set('x-auth-token', token);
    }

    describe('GET /', () => {
      it(`devrait retourner toutes les conversations d'un utilisateur spécifique`, async () => {
        const res = await exec('');
        
        expect(res.body.length).toBe(1);
        expect(res.status).toBe(200);
      });
    });
    describe('GET /:idConversation', () => {
      it('devrait retourner une conversation', async () => {
        const res = await exec(conversationUnId);
        
        expect(res.status).toBe(200);
      });
      it('devrait retourner erreur 400 si id conversation de type invalide (doit être ObjectID)', async () => {
        const res = await exec('a');

        expect(res.status).toBe(400);
      });
      it(`devrait retourner erreur 404 si id conversation de type valide mais n'existe pas`, async () => {
        const res = await exec('1c6304057688880d9227c24b');

        expect(res.status).toBe(404);
      });
    });
  });
  describe('POST /:autreUtilisateur', () => {
    const exec = async (autreUtilisateur) => {
      return await request(serveur)
        .post(`/api/conversation/${autreUtilisateur}`)
        .set('x-auth-token', token)
    }
    it('devrait créer et retourner une conversation', async () => {
      const res = await exec('utilisateurtest2');

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 404 si l'utilisateur à ajouter dans une nouvelle conversation n'existe pas`, async () => {
      const res = await exec('utilisateurinexistant');

      expect(res.status).toBe(404);
    });
    it(`devrait retourner erreur 403 si l'utilisateur à ajouter dans une nouvelle conversation est notre nom`, async () => {
      const res = await exec(nomUtilisateur);

      expect(res.status).toBe(403);
    });
  });
});