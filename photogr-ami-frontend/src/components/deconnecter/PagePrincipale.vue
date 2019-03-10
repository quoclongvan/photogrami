<template>
<section class="authentication">
  <section class="page-principale">
    <div class="principale-partie-un">
      <h2>Site de partage de photos.</h2><h2> Simplifié.</h2>
    </div>
  </section>
  <div class="boite-formulaire">
    <ul class="onglet-authentication">
      <li @click="changeOngletAuth(1)" :class="{'active': ongletConnexion}"
      class="no-selection">Connexion</li>
      <li @click="changeOngletAuth(2)" :class="{'active': ongletInscription}"
      class="no-selection">Inscription</li>
    </ul>
    <div class="formulaire" v-if="ongletConnexion">
      <span v-if="erreurConnexion">
        Nom d'utilisateur/Email et mot de passe invalide.
      </span>
      <input type="text" placeholder="Nom d'utilisateur ou email" maxlength="254"
      v-model="identifiant" @keyup.enter="connexion" :class="{ 'boiteErreur' : erreurConnexion }">
      <span></span>
      <input type="password" placeholder="Mot de passe" maxlength="60"
      v-model="motDePasse" @keyup.enter="connexion" :class="{ 'boiteErreur' : erreurConnexion }">
      <button @click="connexion">Se connecter</button>
      <div class="loader" v-if="chargementConnexion"></div>
    </div>


    <div class="formulaire" v-if="ongletInscription">
      <span v-if="prenomInvalide">
        Le prénom doit contenir au moins 2 caractères
      </span>
      <span v-else class="vide"></span>
      <input type="text" placeholder="Prénom" v-model="prenom" maxlength="35"
      @blur="verifiePrenom" @keyup.enter="creerCompte" :class="{ 'boiteErreur' : prenomInvalide }">
      <span v-if="nomInvalide">
        Le nom de famille doit contenir au moins 2 caractères
      </span>
      <span v-else class="vide"></span>
      <input type="text" placeholder="Nom de famille" maxlength="35"
      v-model="nom" @blur="verifieNom" @keyup.enter="creerCompte"
      :class="{ 'boiteErreur' : nomInvalide }">
      <span v-if="nomUtilisateurInvalide
                || nomUtilisateurInvalideCaractere
                || nomUtilisateurExiste">
        <p v-if="nomUtilisateurInvalide">
          Le nom d'utilisateur doit contenir au moins 6 caractères
        </p>
        <p v-if="nomUtilisateurInvalideCaractere">
          Le nom d'utilisateur ne doit pas contenir le caractère @
        </p>
        <p v-if="nomUtilisateurExiste">Un compte avec ce nom d'utilisateur existe déjà</p>
      </span>
      <span v-else class="vide"></span>
      <input type="text" placeholder="Nom d'utilisateur" maxlength="15"
      :class="{ 'boiteErreur' : nomUtilisateurInvalide
                             || nomUtilisateurInvalideCaractere
                             || nomUtilisateurExiste }"
      v-model="nomUtilisateur" @blur="verifieNomUtilisateur" @keyup.enter="creerCompte">
      <span v-if="emailInvalide || emailExiste">
        <p v-if="emailInvalide">L'email doit être valide</p>
        <p v-if="emailExiste">Un compte avec cet adresse email existe déjà</p>
      </span>
      <span v-else class="vide"></span>
      <input type="email" placeholder="Adresse Email" maxlength="254"
      v-model="email" @blur="verifieEmail" @keyup.enter="creerCompte"
      :class="{ 'boiteErreur' : emailInvalide || emailExiste }">
      <span v-if="motDePasseInvalide">
        Le mot de passe doit contenir au moins 7 caractères
      </span>
      <span v-else class="vide"></span>
      <input type="password" placeholder="Mot de passe" maxlength="60"
      :class="{ 'boiteErreur' : motDePasseInvalide }"
      v-model="nouveauMotDePasse" @blur="verifieMotDePasse" @keyup.enter="creerCompte">
      <div class="option">
        <span>Sexe: </span>
        <select name="sexe" v-model="sexe" @keyup.enter="creerCompte">
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
      <button @click="creerCompte">S'inscrire</button>
      <div class="loader" v-if="chargementInscription"></div>
    </div>
  </div>
  <div class="footer">
    <div>
      <router-link to="/">
        <font-awesome-icon icon="camera-retro" /> Photogr-ami</router-link>
          &copy; 2019&nbsp;
        </div>
    <div>Web Design par <a href="mailto:quoclongvan@gmail.com">Quoc Long Van</a></div>
  </div>
</section>
</template>

<script>
export default {
  data() {
    return {
      ongletConnexion: true,
      ongletInscription: false,
      erreurConnexion: false,
      chargementConnexion: false,
      chargementInscription: false,
      prenom: '',
      nom: '',
      email: '',
      nomUtilisateur: '',
      sexe: 'Homme',
      nouveauMotDePasse: '',
      identifiant: '',
      motDePasse: '',
      prenomInvalide: false,
      nomInvalide: false,
      emailInvalide: false,
      emailExiste: false,
      nomUtilisateurInvalide: false,
      nomUtilisateurInvalideCaractere: false,
      nomUtilisateurExiste: false,
      motDePasseInvalide: false,
    };
  },
  methods: {
    changeOngletAuth(ongletValeur) {
      if (ongletValeur === 1) {
        this.ongletConnexion = true;
        this.ongletInscription = false;
        this.afficheModifProfil = false;
      } else if (ongletValeur === 2) {
        this.ongletConnexion = false;
        this.ongletInscription = true;
      }
    },
    creerCompte() {
      this.chargementInscription = true;
      this.$http.post('/compte/', {
        prenom: this.prenom,
        nom: this.nom,
        email: this.email,
        nomUtilisateur: this.nomUtilisateur,
        motDePasse: this.nouveauMotDePasse,
        sexe: this.sexe,
      }, this.config).then(() => {
        this.prenom = '';
        this.nom = '';
        this.email = '';
        this.nomUtilisateur = '';
        this.nouveauMotDePasse = '';
        this.changeOngletAuth(1);
        this.chargementInscription = false;
      }).catch(() => {
        setTimeout(this.fermeChargementInscription, 750);
      });
    },
    connexion() {
      this.chargementConnexion = true;
      this.$http.post('/authentication/', {
        identifiant: this.identifiant,
        motDePasse: this.motDePasse,
      }, this.config).then((response) => {
        this.chargementConnexion = false;
        localStorage.setItem('token', JSON.stringify(response.data));
        window.location.reload();
      }).catch(() => {
        setTimeout(this.fermeChargementConnexion, 750);
      });
    },
    fermeChargementConnexion() {
      this.chargementConnexion = false;
      this.erreurConnexion = true;
    },
    fermeChargementInscription() {
      this.verifiePrenom();
      this.verifieNom();
      this.verifieNomUtilisateur();
      this.verifieEmail();
      this.verifieMotDePasse();
      this.chargementInscription = false;
    },

    verifiePrenom() {
      if (this.prenom.trim().length < 2) {
        this.prenomInvalide = true;
      } else {
        this.prenomInvalide = false;
      }
    },
    verifieNom() {
      if (this.nom.trim().length < 2) {
        this.nomInvalide = true;
      } else {
        this.nomInvalide = false;
      }
    },
    // Validation pour tous les cas d'email (existante, invalide)
    verifieEmail() {
      // eslint-disable-next-line
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      this.$http.get(`/compte/recherche-email/${this.email}`, this.config).then(() => {
        this.emailExiste = false;
        this.emailInvalide = !re.test(String(this.email).toLowerCase());
      }).catch(() => {
        if (!re.test(String(this.email).toLowerCase())) {
          this.emailExiste = false;
          this.emailInvalide = true;
        } else {
          this.emailExiste = true;
          this.emailInvalide = false;
        }
      });
    },
    // Validation pour tous les cas de nom d'utilisateur (existante, invalide)
    verifieNomUtilisateur() {
      this.$http.get(`/compte/recherche-nom-utilisateur/${this.nomUtilisateur}`, this.config).then(() => {
        if (this.nomUtilisateur.trim().length !== 0) {
          this.nomUtilisateurExiste = true;
          this.nomUtilisateurInvalide = false;
        } else {
          this.nomUtilisateurExiste = false;
          this.nomUtilisateurInvalide = true;
        }
      }).catch(() => {
        this.nomUtilisateurExiste = false;
        if (this.nomUtilisateur.trim().length < 6) {
          this.nomUtilisateurInvalide = true;
        } else {
          this.nomUtilisateurInvalide = false;
        }
        const re = new RegExp('^(?!.*@).*$');
        if (re.test(this.nomUtilisateur.trim())) {
          this.nomUtilisateurInvalideCaractere = false;
        } else {
          this.nomUtilisateurInvalideCaractere = true;
          this.nomUtilisateurInvalide = false;
        }
      });
    },

    verifieMotDePasse() {
      if (this.nouveauMotDePasse.length < 7) {
        this.motDePasseInvalide = true;
      } else {
        this.motDePasseInvalide = false;
      }
    },
  },
};
</script>


<style lang="scss">
section.authentication {
  padding-top: 60px;
  padding-bottom: 80px;
  section.page-principale {
    padding: 0 0 20px 0;
    div.principale-partie-un {
      width: 750px;
      margin: 0px auto 0px;
      padding: 5px;
      text-align: center;
      h2 {
        font-size: 40px;
        animation-timing-function: ease-out;
        &:first-child {
          animation-duration: 2s;
          animation-name: moveInLeft;
        }
        &:last-child {
          animation-duration: 4s;
          animation-name: moveInRight;
        }
      }
      @keyframes moveInLeft {
        0% {
          opacity: 0;
          transform: translateX(-100px);
        }
        80% {
          transform: translateX(5px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes moveInRight {
        0% {
          opacity: 0;
        }
        30% {
          opacity: 0;
          transform: translateX(100px);
        }
        70% {
          transform: translateX(-5px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
    }
  }
  div.footer {
    position: fixed;
    bottom: 0;
    padding: 5px 0;
    width: 100%;
    background-color: #fad2a8;
    text-align: center;

    -webkit-box-shadow: 3px -1px 5px 3px rgba(78, 78, 78, 0.2);
    -moz-box-shadow: 3px -1px 5px 3px rgba(78, 78, 78, 0.2);
    box-shadow: 3px -1px 5px 3px rgba(78, 78, 78, 0.2);
  }
  div.boite-formulaire {
    background-color: #f8f8fc;
    width: 750px;
    margin: 0 auto;
    border: 1px solid black;
    ul {
      border: 1px solid black;
      list-style: none;
      margin-bottom: 10px;
      background-color: white;
      li {
        text-align: center;
        display: inline-block;
        width: 50%;
        padding: 5px;
        &:first-child {
          border-right: 1px solid black;
        }
        &:hover {
          cursor: pointer;
          background-color: rgb(253, 200, 175) !important;
        }
        &:active {
          background-color: rgb(248, 176, 140) !important;
        }
      }
    }
    div.formulaire > input, div.option {
      margin: 5px 5%;
      width: 90%;
    }
    div.formulaire {
      button {
        display: block;
        margin: 0 auto 10px;
      }
      > span {
        font-size: 14px;
        margin: 5px 5%;
        font-weight: bold;
        color: red;
        display: block;
        &:not(.vide) {
          animation-name: afficheAnimation;
          animation-timing-function: ease-out;
          animation-duration: 1s;
        }
      }
      span.vide {
        height: 18px;
      }
      .boiteErreur {
        border: 1px solid red;
        animation-name: afficheBordure;
        animation-timing-function: ease-out;
        animation-duration: 1s;
      }
    }
  }
}
.loader {
  width: 100px;
  height: 100px;
  background-size: cover;
  margin: -25px auto 5px auto;
  background-image: url('../../assets/loading.gif');
}
@media only screen and (max-width: 750px) {
  div.boite-formulaire, div.principale-partie-un {
    width: 96% !important;
  }
  div.principale-partie-un {
    h2 {
      font-size: 30px !important;
    }
  }
}
</style>
