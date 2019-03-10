<template>
<header>
  <div class="header" v-if="utilisateurConnecte">
    <router-link id="logo" to="/"><font-awesome-icon icon="camera-retro" /></router-link>
    <div class="header-recherche">
      <input type="text" placeholder="Rechercher.."
      @keyup.enter="pageRecherche" v-model="texteRecherche"
      maxlength="40" v-on:input="afficheListe()" @click="afficheListe()">
      <div class="recherche-suggestion" :class="{'disparait-animation': (texteRecherche.trim() == ''
        || afficheSuggestion == false),
       'apparait-animation': (texteRecherche.trim() != '' && afficheSuggestion),
       'invisible': animation}">
        <ul>
          <li @click="pageProfil(utilisateur.nomUtilisateur)"
          v-for="(utilisateur, index) in listeRechercheSuggestion"
          :key="utilisateur._id" :value="index">{{ utilisateur.prenom }} {{ utilisateur.nom }}</li>
          <li @click="pageRecherche" v-if="listeRechercheSuggestion.length > 0">
            Voir tous les résultats pour
            <b>«&nbsp;{{ texteRecherche.trim() }}&nbsp;»</b>
          </li>
          <li v-else>Il n'y a aucun résultat pour
            <b>«&nbsp;{{ texteRecherche.trim() }}&nbsp;»</b>
          </li>
        </ul>
      </div>
    </div>
    <ul class="barre-navigation">
      <router-link to="/FilActualite">
        <li title="Fil d'actualité">
          <font-awesome-icon icon="home" />
        </li>
      </router-link>
      <router-link to="/Profil">
        <li title="Votre profil">
          <font-awesome-icon icon="user" />
        </li>
      </router-link>
      <router-link to="/Conversation" title="Vos conversations">
        <li>
          <font-awesome-icon icon="envelope" />
        </li>
      </router-link>
      <router-link to="/Reglages" title="Réglages">
        <li>
          <font-awesome-icon icon="cog" />
        </li>
      </router-link>
    </ul>
  </div>
  <div class="header v2" v-else>
    <router-link id="logo-v2" to="/">
      <font-awesome-icon icon="camera-retro" />
      <h1>Photogr-ami</h1>
    </router-link>
  </div>
  <div class="slider" :class="{ close: popupHide}" @click="redirectionConversation">
    <article class="message">
      <div class="message-header">
        <b>Nouveau message de {{ notificationNom }}</b>
      </div>
      <div class="message-body">
        {{ notificationMessage }}
      </div>
    </article>
  </div>
</header>
</template>

<script>
import authService from '../../services/authentication-service';

export default {
  data() {
    return {
      texteRecherche: this.$route.params.input || '',
      utilisateurConnecte: false,
      afficheSuggestion: false,
      listeRechercheSuggestion: Array,
      animation: true,
      popupHide: true,
      notificationId: '',
      notificationNom: '',
      notificationMessage: '',
      notificationVar: null,
    };
  },
  // Se fait appeler lorsqu'un socket à été émise
  mounted() {
    this.socket.on('NOTIFICATION_CONVERSATION_MESSAGE', (data, utilisateur) => {
      if (utilisateur === this.$store.state.utilisateur.nomUtilisateur
          && !this.$route.path.startsWith('/Conversation')) {
        this.notificationId = data[0].idConversation;
        this.notificationNom = data[1].dernierUtilisateurEnvoi;
        this.notificationMessage = data[1].dernierMessage;
        this.popupHide = false;
        if (this.notificationVar !== null) {
          clearTimeout(this.notificationVar);
        }
        this.notificationVar = setTimeout(this.closePopup, 5000);
      }
    });
  },
  watch: {
    $route() {
      this.afficheSuggestion = false;
    },
  },
  created() {
    this.$store.dispatch('infoUtilisateur');
    // Nécessaire pour enlever un bug d'animation lors du chargement de la page.
    setTimeout(this.changeAnimation, 300);
    this.utilisateurConnecte = this.verifieUtilisateurConnecte();
  },
  methods: {
    closePopup() {
      this.popupHide = true;
    },
    redirectionConversation() {
      this.$router.push(`/Conversation/${this.notificationId}`);
    },
    // Animation CSS
    changeAnimation() {
      this.animation = false;
    },
    // Lorsque l'utilisateur recherche et clique pour voir tous les résultats
    pageRecherche() {
      this.afficheSuggestion = false;
      if (this.texteRecherche.trim() !== '') {
        this.$router.push(`/Recherche/${this.texteRecherche}`);
      }
    },
    // Lorsque l'utilisateur recherche et clique sur un nom de profil
    pageProfil(nomUtilisateur) {
      this.afficheSuggestion = false;
      this.$router.push(`/Profil/${nomUtilisateur}`);
    },
    verifieUtilisateurConnecte() {
      const bool = authService.tokenVide();
      return !bool;
    },
    // Affiche les 3 premiers résultats de recherche lorsque l'utilisateur tape dans la barre
    afficheListe() {
      this.afficheSuggestion = true;
      if (this.texteRecherche.trim() !== '') {
        this.$http.get(`/compte/recherche/${this.texteRecherche}`, this.config).then((response) => {
          this.listeRechercheSuggestion = response.data.slice(0, 3);
        });
      }
    },
  },
};
</script>

<style lang="scss">
// Slider
article.message {
  overflow-wrap: break-word;
  background-color: rgb(255, 240, 233);
  margin: 0;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid black;
  font-family: "Times New Roman", Times, serif !important;
  font-size: 16px;
  div.message-header {
    margin: 0;
    padding: 0;
  }
  b {
    margin: 0 !important;
    padding: 0 !important;
  }
  div.message-body {
    margin-top: 5px;
    font-weight: normal !important;
  }
}
.slider {
  border-radius: 10px;
  position: fixed;
  min-width: 270px;
  min-height: 90px;
  max-height: 150px;
  width: 20vw;
  top: 40px;
  right: 10px;
  overflow: hidden;
  overflow-y: scroll;
  transition: none;
  opacity: 1;
  transition: all 2s;
  transform: translateX(0vw);
  cursor: pointer;
}
.slider.close {
  position: fixed;
  opacity: 0;
  transform: translateX(350px);
  transition: all 2.5s;
  overflow: hidden;
}


header {
  display: inline-block;
  position: fixed;
  top: 0;
  background-color: #fad2a8;
  height: 40px;
  font-size: 30px;
  font-weight: bold;
  -webkit-box-shadow: 3px 1px 5px 3px rgba(78, 78, 78, 0.2);
  -moz-box-shadow: 3px 1px 5px 3px rgba(78, 78, 78, 0.2);
  box-shadow: 3px 1px 5px 3px rgba(78, 78, 78, 0.2);
  min-width: 320px;
  width: 100%;
  z-index: 1;
  div.header {
    margin: 0 auto;
    padding: 0 5px;
    width: 600px;
    a#logo {
      float: left;
      width: 40px;
      height: 40px;
      line-height: 40px;
    }
    a#logo-v2 {
      padding-top: 2.5px;
      line-height: 40px;
      float: left;
      h1 {
        vertical-align: top;
        padding-left: 10px;
        display: inline-block;
        font-size: 20px;
      }
    }
    ul.barre-navigation-v2 {
      float: right;
      list-style: none;
      height: 40px;
      li {
        display: inline-block;
        height: 40px;
        font-size: 20px;
        padding: 8.5px 5px;
        vertical-align: top;
        border-left: 1px solid black;
        border-right: 1px solid black;
        &:hover, &:active {
          background-color: #fabf80;
          cursor: pointer;
          color: black;
        }
      }
    }
    div.header-recherche {
      float: left;
      overflow-y: auto;
      width: 300px;
      input {
        border: 1px solid black !important;
        margin-top: 2px;
        vertical-align: top;
        height: 35px;
        width: 100%;
      }
      div.recherche-suggestion {
        margin-top: 3px;
        overflow: hidden;
        overflow-y: scroll;
        background-color: white;
        border: 1px solid black;
        border-radius: 20px;
        ul {
          li {
            overflow-wrap: break-word;
            min-height: 30px;
            padding: 5px;
            font-weight: normal;
            font-size: 16px;
            border-bottom: 1px solid rgb(110, 110, 110);
            &:last-child {
              border: none !important;
            }
            &:hover {
              cursor: pointer;
              background-color: #eee !important;
            }
            &:active {
              background-color: rgb(204, 204, 204) !important;
            }
          }
        }
      }
    }
    ul.barre-navigation {
      width: 200px;
      float: right;
      li {
        line-height: 40px;
        height: 40px;
        padding: 2.5px 10px;
        text-align: center;
        display: inline-block;
        color: rgb(66, 65, 65);
        &:hover, &:active {
          background-color: rgb(248, 176, 140);
          cursor: pointer;
          color: black;
        }
      }
    }
  }
  .v2 {
    width: 750px !important;
  }
  @media only screen and (max-width: 600px) {
    text-align: center;
    div.header {
      width: 100%;
      padding-right: 0;
      div.header-recherche {
        margin-left: 5px;
        width: calc(100% - 54px);
        input {
          width: 100%;
        }
      }
      ul.barre-navigation {
        display: none !important;
      }
    }
  }
}

a {
  text-decoration: none;
  color: black;
}
</style>
