const request = require('supertest');
const {Conversation} = require('../../models/conversation');
const {Compte} = require('../../models/compte');
const {Message} = require('../../models/message');
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
  let conversationUn = new Conversation({
    _id: conversationUnId,
    listeUtilisateur: ['utilisateurtest1', 'utilisateurtest2'],
    dernierMessage: 'test',
    dernierUtilisateurEnvoi: 'utilisteurtest1'
  });
  await conversationUn.save();
  let messageUn = new Message({
    idConversation: conversationUnId,
    auteur: 'utilisteurtest1',
    message: 'message test'
  });
  await messageUn.save();

  nomUtilisateur = await Compte.findById(compteUnId).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;
});

afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
  await Conversation.remove({});
  await Message.remove({});
});

describe('/api/messages', () => {
  describe('GET /:idConversation', () => {
    const exec = async (idConv) => {
      return await request(serveur)
        .get(`/api/message/${idConv}`)
        .set('x-auth-token', token);
    }
    it(`devrait retourner les messages d'une conversation`, async () => {
      const res = await exec(conversationUnId);
      
      expect(res.body.length).toBe(1);
      expect(res.status).toBe(200);
    });
    it('devrait retourner erreur 400 si id conversation de type invalide (doit être ObjectID)', async () => {
      const res = await exec('a');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 403 si id conversation n'existe pas ou l'utilisateur n'a pas accès`, async () => {
      const res = await exec('1c6304057688880d9227c24b');

      expect(res.status).toBe(403);
    });
  });
  describe('POST /', () => {
    const exec = async (id, message) => {
      return await request(serveur)
        .post(`/api/message/`)
        .set('x-auth-token', token)
        .send({
          idConversation: id,
          message: message
        });
    }
    it('devrait créer et retourner un message', async () => {
      const res = await exec(conversationUnId, 'message test 2');

      expect(res.status).toBe(200);
    });
    it(`devrait retourner erreur 400 si le message est vide`, async () => {
      const res = await exec('asdasd', '');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 400 si id conversation de type invalide (doit être ObjectID)`, async () => {
      const res = await exec('asdasd', 'message test 3');

      expect(res.status).toBe(400);
    });
    it(`devrait retourner erreur 403 si l'utilisateur ne fait pas partie d'une conversation/n'existe pas`, async () => {
      const res = await exec('1c6304057688880d9227c24b', 'message test 4');

      expect(res.status).toBe(403);
    });
  });
});