const request = require('supertest');
const {Compte} = require('../../models/compte');
const mongoose = require('mongoose');
const path = require('path');

let serveur;
let token;
let tokenDeux;
let compteUnId;
let compteDeuxId;
let nomUtilisateur;
beforeEach(async () => {
  serveur = require('../../index');
  compteUnId = mongoose.Types.ObjectId();
  compteDeuxId = mongoose.Types.ObjectId();
  let compteUn = new Compte({
    _id: compteUnId,
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test1@gmail.com',
    nomUtilisateur: 'utilisateurtest1',
    sexe: 'Homme',
    motDePasse: '$2b$10$RjJ.PTVVsV9jwt1n5HSO6O2eahAAZpahjKnQQ4S4yPEYG4/V5jB/C' // Mot de passe 'motdepasse' hashé.
  });
  await compteUn.save();
  token = compteUn.genereAuthToken();
  let compteDeux = new Compte({
    _id: compteDeuxId,
    prenom: 'PrenomTest',
    nom: 'NomTest',
    email: 'test2@gmail.com',
    nomUtilisateur: 'utilisateurtest2',
    sexe: 'Homme',
    motDePasse: 'motdepasse',
    photoProfil: 'photo-profil/photo-specifique.png'
  });
  await compteDeux.save();
  tokenDeux = compteDeux.genereAuthToken();

  nomUtilisateur = await Compte.findById(compteUnId).select('nomUtilisateur');
  nomUtilisateur = nomUtilisateur.nomUtilisateur;
});

afterEach(async () => {
  await serveur.close();
  await Compte.remove({});
});

describe('/api/compte', () => {
  describe('GET /', () => {
    const exec = async (url, params) => {
      return await request(serveur)
        .get(`/api/compte/${url}/${params}`)
        .set('x-auth-token', token);
    }
    describe('GET /moi', () => {
      it(`devrait retourner l'information de mon compte utilisateur'`, async () => {
        const res = await exec('moi', '');
        expect(res.status).toBe(200);
      });
    });
    describe('GET /recherche-nom-utilisateur/:nomUtilisateur', () => {
      it(`devrait retourner l'information d'un compte utilisateur`, async () => {
        const res = await exec('recherche-nom-utilisateur', 'utilisateurtest1');
        expect(res.status).toBe(200);
      });
      it(`devrait retourner erreur 404 si aucun compte n'a ce nom d'utilisateur`, async () => {
        const res = await exec('recherche-nom-utilisateur', 'utilisateurinexistant');
        expect(res.status).toBe(404);
      });
    });
    describe('GET /recherche-email/:email', () => {
      it(`devrait retourner status 200 si l'email n'est pas pris par un utilisateur`, async () => {
        const res = await exec('recherche-email', 'emailinexistant@gmail.com');
        expect(res.status).toBe(200);
      });
      it(`devrait retourner erreur 404 si un compte à déjà cet adresse email`, async () => {
        const res = await exec('recherche-email', 'test1@gmail.com');
        expect(res.status).toBe(404);
      });
    });
    describe('GET /recherche/:input', () => {
      it(`devrait retourner une liste d'utilisateur qui respecte le input, en excluant lui-même`, async () => {
        const res = await exec('recherche', 'e');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
      });
    });
  });
  describe('POST /', () => {
    const exec = async (prenom, nom, email, nomUtilisateur, sexe, motDePasse) => {
      return await request(serveur)
        .post('/api/compte/')
        .set('x-auth-token', token)
        .send({
          prenom: prenom,
          nom: nom,
          email: email,
          nomUtilisateur: nomUtilisateur,
          sexe: sexe,
          motDePasse: motDePasse
        });
    }
    it(`devrait créer un compte utilisateur`, async () => {
      const res = await exec('testprenom', 'testnom', 'testemail@gmail.com', 'testnomutilisateur', 'Homme', 'motdepasse');
      expect(res.status).toBe(200); 
    });
    it(`devrait retourner erreur 400 si un des champs est invalide (exemple: email qui n'est pas un email)`, async () => {
      const res = await exec('testprenom', 'testnom', 'testemail', 'testnomutilisateur', 'Homme', 'motdepasse');
      expect(res.status).toBe(400); 
    });
    it(`devrait retourner erreur 400 si un compte à déjà cet adresse email`, async () => {
      const res = await exec('testprenom', 'testnom', 'test1@gmail.com', 'testnomutilisateur', 'Homme', 'motdepasse');
      expect(res.status).toBe(400); 
    });
    it(`devrait retourner erreur 400 si un compte à déjà ce nom d'utilisateur`, async () => {
      const res = await exec('testprenom', 'testnom', 'testemail@gmail.com', 'utilisateurtest1', 'Homme', 'motdepasse');
      expect(res.status).toBe(400); 
    });
    it(`devrait retourner erreur 400 si le sexe est invalide`, async () => {
      const res = await exec('testprenom', 'testnom', 'testemail@gmail.com', 'testnomutilisateur', 'Invalide', 'motdepasse');
      expect(res.status).toBe(400); 
    });
  });
  describe('PUT /', () => {
    describe('PUT /profil/', () => {
      const exec = async (description, sexe, site) => {
        return await request(serveur)
          .put('/api/compte/profil')
          .set('x-auth-token', token)
          .send({
            description: description,
            sexe: sexe,
            site: site,
          });
      }
      it(`devrait retourner la nouvelle information de mon compte utilisateur`, async () => {
        const res = await exec('description', 'Homme', 'site.com');
        const compteModifier = await Compte.findById(compteUnId);
        
        expect(res.status).toBe(200); 
        expect(compteModifier.site).toBe('site.com');
      });
      it(`devrait retourner erreur 400 si le sexe est invalide`, async () => {
        const res = await exec('description', 'Invalide', 'site');

        expect(res.status).toBe(400); 
      });
    });
    describe('PUT /modifier-email/', () => {
      const exec = async (email, emailConfirmation) => {
        return await request(serveur)
          .put('/api/compte/modifier-email')
          .set('x-auth-token', token)
          .send({
            email: email,
            emailConfirmation: emailConfirmation,
          });
      }
      it(`devrait retourner la nouvelle information (email) de mon compte utilisateur`, async () => {
        const res = await exec('test3@gmail.com', 'test3@gmail.com');
        const compteModifier = await Compte.findById(compteUnId);

        expect(res.status).toBe(200); 
        expect(compteModifier.email).toBe('test3@gmail.com');
      });
      it(`devrait retourner erreur 400 si le nouvel email est invalide`, async () => {
        const res = await exec('test3', 'test3');

        expect(res.status).toBe(400); 
      });
      it(`devrait retourner erreur 400 si le nouvel email pas égal à l'email de confirmation`, async () => {
        const res = await exec('test3@gmail.com', 'test4@gmail.com');

        expect(res.status).toBe(400); 
      });
      it(`devrait retourner erreur 400 si le nouvel email égal à l'email actuel de l'utilisateur`, async () => {
        const res = await exec('test1@gmail.com', 'test1@gmail.com');

        expect(res.status).toBe(400); 
      });
      it(`devrait retourner erreur 400 si un compte à déjà cet adresse email`, async () => {
        const res = await exec('test2@gmail.com', 'test2@gmail.com');

        expect(res.status).toBe(400); 
      });
    });
    describe('PUT /modifier-mot-de-passe/', () => {
      const exec = async (mdpActuel, nouveauMDP, nouveauMDPConfirmation) => {
        return await request(serveur)
          .put('/api/compte/modifier-mot-de-passe')
          .set('x-auth-token', token)
          .send({
            mdpActuel: mdpActuel,
            nouveauMDP: nouveauMDP,
            nouveauMDPConfirmation: nouveauMDPConfirmation,
          });
      }
      it(`devrait avoir modifier le mot de passe du compte utilisateur`, async () => {
        const res = await exec('motdepasse', 'nouveaumotdepasse', 'nouveaumotdepasse');

        expect(res.status).toBe(200); 
      });
      it(`devrait retourner erreur 400 si les nouveaux mot de passe sont invalide (moins que 7 caractères)`, async () => {
        const res = await exec('motdepasse', 'mdpmdp', 'mdpmdp');

        expect(res.status).toBe(400); 
      });
      it(`devrait retourner erreur 400 si les nouveaux mot de passe ne sont pas pareils`, async () => {
        const res = await exec('motdepasse', 'mdpmdp1', 'mdpmdp2');

        expect(res.status).toBe(400); 
      });
    });
    describe('PUT /abonnement-utilisateur/:autreUtilisateur', () => {
      const exec = async (autreUtilisateur) => {
        return await request(serveur)
          .put(`/api/compte/abonnement-utilisateur/${autreUtilisateur}`)
          .set('x-auth-token', token)
          .send({});
      }
      it(`devrait s'être abonné ou désabonné d'un utilisateur`, async () => {
        const res = await exec('utilisateurtest2');

        expect(res.status).toBe(200); 
      });
      it(`devrait retourner erreur 400 si l'utilisateur tente de s'abonner à lui-même`, async () => {
        const res = await exec('utilisateurtest1');

        expect(res.status).toBe(400); 
      });
      it(`devrait retourner erreur 404 si l'utilisateur tente de s'abonner à un utilisateur inexistant`, async () => {
        const res = await exec('utilisateurtest3');

        expect(res.status).toBe(404); 
      });
    });
    describe('PUT /photo-de-profil/', () => {
      const exec = async (photoFichier) => {
        return await request(serveur)
          .put('/api/compte/photo-de-profil')
          .set('x-auth-token', token)
          .attach('profilImage', photoFichier);
      }
      it(`devrait changer la photo de profil de l'utilisateur`, async () => {
        const res = await exec(path.join(__dirname, '../../photo-profil/photo-defaut.png'));

        expect(res.status).toBe(200); 
      }); 
      it(`devrait retourner erreur 400 si l'utilisateur ne transmet pas une photo`, async () => {
        const res = await exec('');

        expect(res.status).toBe(400); 
      });
    });
    describe('PUT /retirer-photo-profil/', () => {
      const exec = async (token) => {
        return await request(serveur)
          .put('/api/compte/retirer-photo-profil')
          .set('x-auth-token', token)
          .send({});
      }
      it(`devrait avoir effacer la photo de profil qu'il avait défini auparavant`, async () => {
        const res = await exec(tokenDeux);
        expect(res.status).toBe(200); 
      });
      it(`devrait retourner erreur 404 si l'utilisateur tente de retirer une photo de profil non-défini (photo qu'il a choisi)`, async () => {
        const res = await exec(token);
        expect(res.status).toBe(404); 
      });
    });
  });
});