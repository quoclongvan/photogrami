const {Compte} = require('../../models/compte');
const request = require('supertest');
const mongoose = require('mongoose');

let serveur;
let token;
let compteId;
beforeEach(async () => {
  serveur = require('../../index');
  compteId = mongoose.Types.ObjectId();
  let compte = new Compte({
    _id: compteId,
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test1@gmail.com',
    nomUtilisateur: 'utilisateurtest1',
    sexe: 'Homme',
    motDePasse: '$2b$10$RjJ.PTVVsV9jwt1n5HSO6O2eahAAZpahjKnQQ4S4yPEYG4/V5jB/C', // Mot de passe 'motdepasse' hashé.
  });
  await compte.save();
  token = compte.genereAuthToken();
});
afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
});

describe('authentication (login)', () => {
  const exec = (identifiant, motDePasse) => {
    return request(serveur)
      .post('/api/authentication')
      .send({
        identifiant: identifiant,
        motDePasse: motDePasse
      });
  }
  it(`devrait retourner le token si la connexion par nom d'utilisateur est valide`, async () => {
    const res = await exec('utilisateurtest1', 'motdepasse');
    
    expect(res.status).toBe(200);
  });
  it(`devrait retourner le token si la connexion par email est valide`, async () => {
    const res = await exec('test1@gmail.com', 'motdepasse');

    expect(res.status).toBe(200);
  });
  it('devrait retourner 400 si le format du body est vide ou invalide', async () => {
    const res = await exec('', 'motdepasse');

    expect(res.status).toBe(400);
  });
  it(`devrait retourner 400 si l'email/nom d'utilisateur n'existe pas`, async () => {
    const res = await exec('nominexistant', 'motdepasse');

    expect(res.status).toBe(400);
  });
  it(`devrait retourner 400 si l'email est valide mais le mot de passe est incorrect`, async () => {
    const res = await exec('utilisateurtest1', 'motdepasseincorrect');

    expect(res.status).toBe(400);
  });
  it(`devrait retourner 400 si le nom d'utilisateur est valide mais le mot de passe est incorrect`, async () => {
    const res = await exec('test1@gmail.com', 'motdepasseincorrect');

    expect(res.status).toBe(400);
  });
});

describe('authentication middleware', () => {
  const exec = () => {
    return request(serveur)
      .get('/api/conversation')
      .set('x-auth-token', token);
  }
  it('devrait retourner 401 si aucun token transmis en paramètre', async () => {
    token = ''; 

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('devrait retourner 401 si token est invalide', async () => {
    token = 'a'; 

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('devrait retourner 200 si token est valide', async () => {
    const res = await exec();

    let nomUtilisateur = await Compte.findById(compteId).select('nomUtilisateur');
    nomUtilisateur = nomUtilisateur.nomUtilisateur;

    expect(res.status).toBe(200);
  });
});