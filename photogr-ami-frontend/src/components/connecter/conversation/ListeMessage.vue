<template>
<div>
  <div v-if="afficheListeMessage">
    <button class="nouveau-message" title="Créer une conversation avec un autre utilisateur"
    @click="afficheListeMessage = false">
      Nouvelle conversation
    </button>
    <div></div>
    <h1>Vos conversations</h1>
    <ul class="liste" v-if="listeConversation.length > 0">
      <li @click="afficheMessage(conversation._id)"
      :title="`Afficher la conversation avec ${conversation.nomConversation}`"
      v-for="(conversation, index) in listeConversation" :key="conversation._id" :value="index">
        <div>
          <span>{{ conversation.nomConversation }}</span>
          <span>{{ dateConversation(conversation.dernierDate) }}</span>
          <span>{{ conversation.dernierUtilisateurEnvoi }}: {{ conversation.dernierMessage }}</span>
        </div>
      </li>
    </ul>
    <ul class="liste" v-else>
      <li class="aucune">Il n'y a aucune conversation pour le moment,
        vous pouvez créer une conversation ci-dessus</li>
    </ul>
  </div>

  <div v-else>
    <button class="nouveau-message" @click="afficheListeMessage = true">
      Annuler
    </button>
    <h1>Nouvelle conversation</h1>
    <input type="text" placeholder="Recherche utilisateur"
    v-model="texteRecherche" v-on:input="afficheListeRecherche()">
    <div class="liste-utilisateur-recherche" v-if="listeRecherche.length > 0">
      <div class="un-utilisateur-recherche"
      :class="{'active': (utilisateur.nomUtilisateur == utilisateurSelectionneRecherche)}"
      @click="utilisateurSelectionneRecherche = utilisateur.nomUtilisateur"
      v-for="(utilisateur, index) in listeRecherche" :key="utilisateur._id" :value="index">
        {{ utilisateur.prenom }} {{ utilisateur.nom }} <b>@{{ utilisateur.nomUtilisateur }}</b>
      </div>
    </div>
    <div class="liste-utilisateur-recherche"
    v-if="listeRecherche.length == 0 && texteRecherche.trim() !== ''">
      <div class="un-utilisateur-recherche">
        Il n'y a aucun résultat pour la recherche «&nbsp;{{ texteRecherche }}&nbsp;»
      </div>
    </div>
    <span class="creerConvQuestion" v-if="utilisateurSelectionneRecherche != ''">
      Voulez-vous créer une conversation avec <b>@{{ utilisateurSelectionneRecherche }}</b>?
    </span>
    <button @click="creerConversation()" v-if="utilisateurSelectionneRecherche != ''"
    class="bouton-margin">Créer la conversation</button>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      afficheListeMessage: true,
      texteRecherche: '',
      listeRecherche: [],
      utilisateurSelectionneRecherche: '',
      listeConversation: [],
    };
  },
  // Se fait appeler lorsqu'un socket à été émise
  mounted() {
    this.socket.on('UPDATE_CONVERSATION_LISTE', () => {
      this.afficheListeConversation();
    });
  },
  methods: {
    afficheMessage(id) {
      this.$parent.mobileAfficheListeMessage = true;
      this.$router.push(`/Conversation/${id}`);
    },
    // Affiche les 5 premier résultats correspondant à la liste de recherche
    afficheListeRecherche() {
      if (this.texteRecherche.trim() !== '') {
        this.$http.get(`/compte/recherche/${this.texteRecherche}`, this.config).then((response) => {
          this.listeRecherche = response.data.splice(0, 5);
        });
      }
    },
    afficheListeConversation() {
      this.$http.get('/conversation/', this.config).then((response) => {
        this.listeConversation = response.data;
      });
    },
    // Formattage de la date d'affichage
    dateConversation(date) {
      const dateString = new Date(date);
      const dateTxt = `${((dateString.getDate() < 10) ? '0' : '') + dateString.getDate()}/${((dateString.getMonth() < 10) ? '0' : '') + (dateString.getMonth() + 1)} à ${(dateString.getHours())}h${((dateString.getMinutes() < 10) ? '0' : '') + dateString.getMinutes()}`;
      return dateTxt;
    },
    creerConversation() {
      this.$http.post(`/conversation/${this.utilisateurSelectionneRecherche}`, {}, this.config).then((response) => {
        this.texteRecherche = '';
        this.listeRecherche = [];
        this.utilisateurSelectionneRecherche = '';
        this.$socket.emit('UPDATE_CONVERSATION_LISTE');
        // eslint-disable-next-line
        this.$router.push(`/Conversation/${response.data._id}`);
      });
      this.afficheListeConversation();
      this.afficheListeMessage = true;
    },
  },
  created() {
    this.afficheListeConversation();
    if (localStorage.getItem('conversation')) {
      this.$parent.mobileAfficheListeMessage = true;
    }
  },
};
</script>


<style lang="scss">
div.liste-message {
  width: 30%;
  height: 100%;
  float: left;
  > div {
    > div {
      height: 100%;
    }
    height: 100%;
  }
  button.nouveau-message {
    margin: 20px 5%;
  }
  ul.liste {
    margin: 0 2%;
    width: 96%;
    border: 1px solid black;
    overflow: hidden;
    overflow-y: scroll;
    max-height: calc(100% - 83px);
    li {
      background-color: white;
      border-top: 1px solid black;
      border-bottom: 1px solid black;
      div {
        padding: 5px;
        height: 100px;
        overflow-y: scroll;
        span:nth-child(2) {
          float: right;
        }
        span:last-child {
          margin-top: 5px;
          display: block;
          overflow-wrap: break-word;
        }
      }
      &:hover {
        cursor: pointer;
        opacity: 0.8;
      }
      &.aucune {
        padding: 5px;
        &:hover {
          cursor: unset;
        }
      }
    }
  }
  h1 {
    text-align: center;
  }
  input, div.liste-utilisateur-recherche, button, .creerConvQuestion {
    margin-left: 5%;
    width: 90%;
    border: 1px solid black;
  }
  .creerConvQuestion {
    display: block;
    margin-top: 20px;
    border: none;
    overflow-wrap: break-word;
  }
  button {
    margin: 20px 5% 0;
  }
  div.liste-utilisateur-recherche {
    border: none;
    div.un-utilisateur-recherche {
      background-color: white;
      border: 1px solid black;
      padding: 5px;
      overflow-wrap: break-word;
      b {
        margin-top: 5px;
        display: block;
      }
      &:hover {
        background-color: rgb(204, 204, 204) !important;
        cursor: pointer;
      }
      &:first-child {
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
      }
      &:last-child {
        border-bottom-left-radius: 20px;
        border-bottom-right-radius: 20px;
      }
    }
  }
}
@media only screen and (max-width: 767px) {
  div.liste-message {
    width: 100%;
  }
  .invisibleMobile {
    display: none;
  }
}
@media only screen and (max-width: 600px) {
  ul.liste {
    max-height: calc(100% - 123px) !important;
  }
}
</style>
