<template>
<div>
  <h2 @click="afficheListeMessage"><font-awesome-icon icon="angle-left" /></h2>
  <h1 v-if="nomAutreUtilisateur !== ''">
    <router-link :to="`/Profil/${nomAutreUtilisateur}`">{{ titreConversation }}</router-link>
  </h1>
  <h1 v-else>
    Veuillez sélectionner une conversation
  </h1>
  <div class="zone-message" v-if="afficheBoiteConversation">
    <div v-for="(message, index) in listeMessageConversation" :key="message._id" :value="index">
      <div class="autre-utilisateur" v-if="message.auteur != nomUtilisateur">
        <span>{{ dateMessage(message.date) }}</span>
        <span>{{ message.message }}</span>
      </div>
      <div class="notre-message" v-if="message.auteur == nomUtilisateur">
        <span>{{ dateMessage(message.date) }}</span>
        <span>{{ message.message }}</span>
      </div>
    </div>
  </div>
  <div class="zone-envoi" v-if="afficheBoiteConversation">
    <input type="text" placeholder="Tapez un message..."
    v-model="texteEnvoi" @keyup.enter="envoiMessage">
    <button @click="envoiMessage">Envoyer</button>
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      nomUtilisateur: String,
      titreConversation: '',
      nomAutreUtilisateur: '',
      afficheBoiteConversation: false,
      texteEnvoi: '',
      listeMessageConversation: [],
    };
  },
  // Se fait appeler lorsqu'un socket à été émise
  mounted() {
    this.socket.on('UPDATE_CONVERSATION_MESSAGE', (utilisateur) => {
      if (utilisateur === localStorage.getItem('conversation')) {
        this.afficheMessageConversation();
      }
    });
  },
  methods: {
    afficheListeMessage() {
      this.$parent.mobileAfficheListeMessage = false;
      localStorage.removeItem('conversation');
    },
    afficheConversation() {
      this.$http.get(`/conversation/${localStorage.getItem('conversation')}`, this.config).then((response) => {
        this.titreConversation = response.data.nomConversation;
        this.nomAutreUtilisateur = response.data.autreUtilisateur;
        this.afficheMessageConversation();
        this.afficheBoiteConversation = true;
      }).catch(() => {
        localStorage.removeItem('conversation');
        this.afficheBoiteConversation = false;
        this.$parent.mobileAfficheListeMessage = false;
      });
    },
    afficheMessageConversation() {
      Promise.resolve(this.$http.get(`/message/${localStorage.getItem('conversation')}`, this.config).then((response) => {
        this.listeMessageConversation = response.data;
      })).then(() => {
        if (this.listeMessageConversation.length !== 0) {
          const messageBody = document.getElementsByClassName('zone-message');
          messageBody[0].scrollTop = messageBody[0].scrollHeight;
        }
      });
    },
    // Formattage de la date d'affichage
    dateMessage(date) {
      const dateString = new Date(date);
      const dateTxt = `${(dateString.getHours())}h${((dateString.getMinutes() < 10) ? '0' : '') + dateString.getMinutes()}`;
      return dateTxt;
    },
    envoiMessage() {
      if (this.texteEnvoi.trim() !== '') {
        this.$http.post('/message/', {
          idConversation: localStorage.getItem('conversation'),
          message: this.texteEnvoi,
        }, this.config).then((response) => {
          this.texteEnvoi = '';
          this.$socket.emit('UPDATE_CONVERSATION_MESSAGE', localStorage.getItem('conversation'));
          this.$socket.emit('UPDATE_CONVERSATION_LISTE');
          this.$socket.emit('NOTIFICATION_CONVERSATION_MESSAGE', response.data, this.nomAutreUtilisateur);
        });
      }
    },
    // S'assure que le path du URL est toujours /conversation/
    // tout en affichant la bonne conversation
    configurerURL() {
      if (this.$route.params.nom !== undefined) {
        localStorage.setItem('conversation', this.$route.params.nom);
        this.$router.push('/Conversation/');
      } else if (localStorage.getItem('conversation')) {
        this.afficheConversation();
        this.$parent.mobileAfficheListeMessage = true;
      }
    },
  },
  watch: {
    $route() {
      this.configurerURL();
    },
  },
  created() {
    Promise.resolve(this.$store.dispatch('infoUtilisateur')).then(() => {
      this.nomUtilisateur = this.$store.state.utilisateur.nomUtilisateur;
      this.configurerURL();
    });
  },
};
</script>


<style lang="scss">
div.boite-message {
  padding-top: 20px;
  width: 70%;
  height: 100%;
  float: right;
  h2 {
    display: none;
  }
  h1 {
    width: 80%;
    text-align: center;
    margin: 0 auto;
    height: 35px;
  }
  div.zone-message {
    background-color: white;
    margin: 0 auto;
    height: calc(100% - 50px);
    border: 1px solid black;
    width: 96%;
    overflow: hidden;
    overflow-y: scroll;
    div.autre-utilisateur, div.notre-message {
      width: 100%;
      height: auto;
      overflow: auto;
      span {
        padding: 3px;
      }
      span:first-child {
        margin-top: 5px;
        display: inline-block;
        width: 55px;
        vertical-align: top;
      }
      span:last-child {
        padding: 10px;
        margin: 2px 0;
        border-radius: 10px;
        background-color: #dfdfdf;
        max-width: calc(100% - 155px);
        display: inline-block;
        overflow-wrap: break-word;
      }
    }
    div.notre-message {
      span {
        float: right;
      }
      span:last-child {
        background-color: rgb(182, 231, 250);
      }
    }
  }
  div.zone-envoi {
    width: 96%;
    margin: 0 auto;
    input {
      width: calc(100% - 100px);
      border-radius: 0;
    }
    button {
      width: 100px;
      border-radius: 0;
    }
  }
}
@media only screen and (max-width: 767px) {
  div.boite-message {
    width: 100%;
    h2 {
      display: inline-block;
      width: 10%;
      padding-left: 2%;
      cursor: pointer;
    }
    h1 {
      display: inline-block;
    }
  }
}
@media only screen and (max-width: 600px) {
  h1 {
    font-size: 18px;
  }
  div.zone-message {
    height: calc(100% - 90px) !important;
  }
}
</style>
