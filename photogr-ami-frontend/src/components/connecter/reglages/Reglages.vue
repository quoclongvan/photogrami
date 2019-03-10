<template>
<section class="reglages">
  <div class="boite-reglages">
    <h1>Réglages</h1>
    <div class="reglages-section">
      <div class="reglages-titre">Adresse Email</div>
      <div class="reglages-info" v-if="!reglagesEmail">
        <b class="succes" v-if="succesEmail">L'email a été changé avec succès</b>
        <span>{{ email }}</span>
        <span @click="modifier(1)" title="Modifier l'email">Modifier</span>
      </div>
      <div class="reglages-info" v-else>
        <b v-if="emailPasIdentique">Les deux adresses email ne sont pas identiques</b>
        <b v-if="emailExiste && nouvelEmail.trim().toLowerCase() !== email">
          Un compte avec cet adresse email existe déjà
        </b>
        <b v-if="emailExiste && nouvelEmail.trim().toLowerCase() === email">
          Le nouvel adresse email doit être différent que votre adresse email actuel
        </b>
        <b v-if="emailInvalide">L'email doit être valide</b>
        <p>{{ email }}</p>
        <input class="reglages-info-modif" type="email"
        v-model="nouvelEmail" placeholder="Nouvelle adresse email" @keyup.enter="sauvegarder(1)"
        v-on:input="if (emailExiste) emailExiste = false" maxlength="254">
        <input class="reglages-info-modif" type="email" @keyup.enter="sauvegarder(1)"
        v-model="nouvelEmailConfirmation" placeholder="Confirmer nouvelle adresse email"
        v-on:input="if (emailExiste) emailExiste = false" maxlength="254">
        <input type="submit" value="Sauvegarder" @click="sauvegarder(1)">
        <input type="submit" value="Annuler" @click="annuler(1)">
      </div>
    </div>
    <div class="reglages-section">
      <div class="reglages-titre">Mot de passe</div>
      <div class="reglages-info" v-if="!reglagesMDP">
        <b class="succes" v-if="succesMDP">Le mot de passe a été changé avec succès</b>
        <span>********</span>
        <span @click="modifier(2)" title="Modifier le mot de passe">Modifier</span>
      </div>
      <div class="reglages-info" v-else>
        <b v-if="mdpPasIdentique">Les nouveaux mot de passe ne sont pas identiques</b>
        <b v-if="mdpIncorrect">Le mot de passe actuel est incorrect</b>
        <b v-if="mdpInvalide">Le nouveau mot de passe doit contenir au moins 7 caractères</b>
        <input class="reglages-info-modif" v-model="mdpActuel" maxlength="60"
        type="password" placeholder="Mot de passe actuel" @keyup.enter="sauvegarder(2)">
        <input class="reglages-info-modif" v-model="mdpNouveau" maxlength="60"
        type="password" placeholder="Nouveau mot de passe" @keyup.enter="sauvegarder(2)">
        <input class="reglages-info-modif" v-model="mdpNouveauConfirmation" type="password"
        placeholder="Confirmer nouveau mot de passe" @keyup.enter="sauvegarder(2)" maxlength="60">
        <input type="submit" value="Sauvegarder" @click="sauvegarder(2)">
        <input type="submit" value="Annuler" @click="annuler(2)">
      </div>
    </div>
    <div class="reglages-section">
      <input type="submit" value="Se déconnecter" @click="deconnexion">
    </div>
  </div>
</section>
</template>

<script>
import authService from '../../../services/authentication-service';

export default {
  data() {
    return {
      email: '',
      reglagesEmail: false,
      reglagesMDP: false,
      nouvelEmail: '',
      nouvelEmailConfirmation: '',
      emailExiste: false,
      emailInvalide: false,
      emailPasIdentique: false,
      succesEmail: false,
      mdpActuel: '',
      mdpNouveau: '',
      mdpNouveauConfirmation: '',
      mdpPasIdentique: false,
      mdpInvalide: false,
      mdpIncorrect: false,
      succesMDP: false,
    };
  },
  methods: {
    // Lorsque l'utilisateur veut modifier, restaure les valeurs vides par défaut
    // (peut être rempli s'il a déjà commencé à modifier auparavant et annuler)
    modifier(ligne) {
      if (ligne === 1) {
        this.reglagesEmail = true;
        this.emailExiste = false;
        this.emailInvalide = false;
        this.emailPasIdentique = false;
        this.nouvelEmail = '';
        this.nouvelEmailConfirmation = '';
      } else if (ligne === 2) {
        this.mdpPasIdentique = false;
        this.mdpInvalide = false;
        this.mdpIncorrect = false;
        this.mdpActuel = '';
        this.mdpNouveau = '';
        this.mdpNouveauConfirmation = '';
        this.reglagesMDP = true;
      }
    },
    // Restaure les valeurs par défaut et ferme la section de modification
    annuler(ligne) {
      if (ligne === 1) {
        this.reglagesEmail = false;
        this.email = this.$store.state.utilisateur.email;
      } else if (ligne === 2) {
        this.reglagesMDP = false;
      }
    },
    sauvegarder(ligne) {
      if (ligne === 1) {
        this.$http.put('/compte/modifier-email/', {
          email: this.nouvelEmail,
          emailConfirmation: this.nouvelEmailConfirmation,
        }, this.config).then(() => {
          Promise.resolve(this.$store.dispatch('infoUtilisateur')).then(() => {
            this.email = this.$store.state.utilisateur.email;
            this.succesEmail = true;
            setTimeout(this.fermerSucces, 3000);
          });
          this.reglagesEmail = false;
        }).catch(() => {
          this.verifieEmail();
        });
      } else if (ligne === 2) {
        this.changeMDP();
      }
    },
    // Validation pour tous les cas d'email (existante, invalide, 2 emails pas identiques)
    verifieEmail() {
      // eslint-disable-next-line
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      this.$http.get(`/compte/recherche-email/${this.nouvelEmail}`, this.config).then(() => {
        if (this.nouvelEmail.trim().toLowerCase()
        !== this.nouvelEmailConfirmation.trim().toLowerCase()) {
          this.emailExiste = false;
          this.emailInvalide = false;
          this.emailPasIdentique = true;
        } else {
          this.emailExiste = false;
          this.emailInvalide = !re.test(String(this.nouvelEmail).toLowerCase());
          this.emailPasIdentique = false;
        }
      }).catch(() => {
        if (this.nouvelEmail.trim().toLowerCase()
        !== this.nouvelEmailConfirmation.trim().toLowerCase()
        ) {
          this.emailExiste = false;
          this.emailInvalide = false;
          this.emailPasIdentique = true;
        } else if (!re.test(String(this.nouvelEmail).toLowerCase())) {
          this.emailExiste = false;
          this.emailInvalide = true;
          this.emailPasIdentique = false;
        } else {
          this.emailExiste = true;
          this.emailInvalide = false;
          this.emailPasIdentique = false;
        }
      });
    },
    // Validation pour tous les cas de mot de passe
    // (incorrect, invalide, 2 mot de passe pas identiques)
    changeMDP() {
      if (this.mdpNouveauConfirmation.length < 7) {
        this.mdpInvalide = true;
        this.mdpPasIdentique = false;
        this.mdpIncorrect = false;
      } else if (this.mdpNouveau !== this.mdpNouveauConfirmation) {
        this.mdpPasIdentique = true;
        this.mdpInvalide = false;
        this.mdpIncorrect = false;
      } else {
        this.$http.put('/compte/modifier-mot-de-passe/', {
          mdpActuel: this.mdpActuel,
          nouveauMDP: this.mdpNouveau,
          nouveauMDPConfirmation: this.mdpNouveauConfirmation,
        }, this.config).then(() => {
          this.reglagesMDP = false;
          this.succesMDP = true;
          setTimeout(this.fermerSucces, 3000);
        }).catch(() => {
          this.mdpInvalide = false;
          this.mdpPasIdentique = false;
          this.mdpIncorrect = true;
        });
      }
    },
    fermerSucces() {
      this.succesEmail = false;
      this.succesMDP = false;
    },
    deconnexion() {
      authService.deconnexion();
      window.location.reload();
    },
  },
  created() {
    Promise.resolve(this.$store.dispatch('infoUtilisateur')).then(() => {
      this.email = this.$store.state.utilisateur.email;
    });
  },
};
</script>

<style lang="scss">
section.reglages {
  div.boite-reglages {
    padding: 20px 20px !important;
    height: 100%;
    width: 930px;
    margin: 0 auto;
    h1 {
      padding-bottom: 20px;
    }
    div.reglages-section {
      overflow: auto;
      padding: 10px 0;
      &:first-of-type {
        border-bottom: 1px solid black;
      }
      div.reglages-titre {
        float: left;
        width: 120px;
        font-weight: bold;
      }
      div.reglages-info {
        width: calc(100% - 140px);
        float: right;
        text-align: justify;
        overflow-wrap: break-word;
        b {
          font-size: 14px;
          font-weight: bold;
          color: red;
          display: block;
          &:not(.vide) {
            animation-name: afficheAnimation;
            animation-timing-function: ease-out;
            animation-duration: 1s;
          }
          &.succes {
            color: green !important;
          }
        }
        textarea.reglages-info-modif {
          resize: vertical;
          max-height: 200px;
          width: 99%;
          padding: 5px;
          font-size: 16px;
          border-radius: 3px;
          border: 1px solid black;
        }
        span:last-child {
          cursor: pointer;
          float: right;
        }
        input.reglages-info-modif {
          width: 100%;
          margin-bottom: 3px;
        }
        input[type=submit] {
          margin-right: 3px;
        }
      }
    }
  }
}
@media only screen and (max-width: 900px) {
  div.boite-reglages {
    width: 100% !important;
  }
}
@media only screen and (max-width: 450px) {
  div.boite-reglages {
    h1 {
      text-align: center;
    }
    div.reglages-titre {
      width: 80px !important;
    }
    div.reglages-info {
      span:first-child {
        display: inline-block;
        width: calc(100% - 65px) !important;
      }
      width: calc(100% - 100px) !important;
    }
  }
}
</style>
