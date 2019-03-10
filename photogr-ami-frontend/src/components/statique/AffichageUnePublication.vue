<template>
<div>
  <section class="une-publication">
    <div class="publication">
      <div class="titre-une-publication">
        <h2 id="popup" @click="fermerPopup"><font-awesome-icon icon="angle-left"/></h2>
        <h1><router-link :to="`/Profil/${objetPublication.auteur}`">
        {{ objetPublication.auteur }}
        </router-link></h1>
        <b v-if="this.$store.state.utilisateur.nomUtilisateur == objetPublication.auteur"
        @click="supprimePublication(objetPublication._id)">
          <font-awesome-icon icon="ban" />
        </b>
      </div>
      <div class="publication-image">
        <div class="shadow" :style="`background-image: url(/${objetPublication.photo};`"></div>
        <img :src="`/${objetPublication.photo}`" alt="" draggable="false">
      </div>
      <div class="publication-interaction">
        <div class="description-publication">
          {{ objetPublication.description }}
        </div>
        <span>Publié le {{ dateFormat(objetPublication.date )}}</span>
        <span>
          <span class="hoverable" @click="afficheListeAime()"
          title="Voir les mentions j'aime">{{ nombreAime }} J'aime</span>
          - {{ listeCommentaire.length }}
          Commentaire<span v-if="listeCommentaire.length > 1">s</span>
        </span>
        <div class="publication-bouton">
          <button @click="changeStatusAime" v-if="!statusAime">J'aime</button>
          <button @click="changeStatusAime" v-else>Je n'aime plus</button>
          <button @click="$refs.commentaire.focus()">Commenter</button>
        </div>
        <input type="text" ref="commentaire" v-model="texteEnvoi"
        @keyup.enter="envoiCommentaire" placeholder="Écrire un commentaire..">
        <div class="publication-commentaire" v-if="listeCommentaire.length > 0">
          <span v-for="(commentaire, index) in listeCommentaire"
          :key="commentaire._id" :value="index">
            <p>
              <button v-if="commentaire.auteur === nomUtilisateur"
              @click="supprimeCommentaire(commentaire._id)">X</button>
              <button v-else-if="objetPublication.auteur === nomUtilisateur"
              @click="supprimeCommentaire(commentaire._id)">X</button>
              <b>
                <router-link :to="`/Profil/${commentaire.auteur}`">
                  {{ commentaire.auteur }}
                </router-link>
              </b> {{ commentaire.commentaire }}
            </p>
            <div class="commentaire-date">{{ dateCommentaire(commentaire.date) }}</div>
          </span>
        </div>
        <div class="publication-commentaire" v-else>
          <span>
            <p>Il n'y a pas de commentaire pour l'instant.
              Vous pouvez commenter cette publication.</p>
          </span>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
export default {
  props: {
    objetPublication: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      nombreAime: Number,
      statusAime: false,
      typeListe: null,
      listeCommentaire: Array,
      texteEnvoi: '',
      nomUtilisateur: this.$store.state.utilisateur.nomUtilisateur,
    };
  },
  mounted() {
    this.socket.on('UPDATE_COMMENTAIRE', (id) => {
      // eslint-disable-next-line
      if (this.objetPublication._id === id) {
        this.afficheCommmentaire();
      }
    });
  },
  watch: {
    // eslint-disable-next-line
    objetPublication: function () {
      this.nombreAime = Number(this.objetPublication.listeUtilisateurAime.length);
      if (this.objetPublication.listeUtilisateurAime
        .indexOf(this.$store.state.utilisateur.nomUtilisateur) !== -1) {
        this.statusAime = true;
      } else {
        this.statusAime = false;
      }
    },
  },
  methods: {
    fermerPopup() {
      this.supprimePublication = null;
      this.$emit('fermerPopup');
    },
    // Formattage de la date d'affichage
    dateFormat(d) {
      const date = new Date(d);
      return `${date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })} à ${date.getHours()}h${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}`;
    },
    changeStatusAime() {
      // eslint-disable-next-line
      this.$http.put(`/publication/change-status/${this.objetPublication._id}`, {}, this.config).then(() => {
        this.$socket.emit('UPDATE_PROFIL', this.objetPublication.auteur);
        this.$socket.emit('UPDATE_PUBLICATION_SPECIFIQUE', this.objetPublication.auteur);
        this.$socket.emit('UPDATE_PUBLICATION_TOUT');
      });
    },
    supprimePublication(id) {
      this.$emit('setIDPublication', id);
    },
    supprimeCommentaire(id) {
      // eslint-disable-next-line
      this.$emit('setIDCommentaire', id, this.objetPublication._id);
    },
    afficheListeAime() {
      this.$emit('setListeAime', this.objetPublication.listeUtilisateurAime);
    },
    afficheCommmentaire() {
      // eslint-disable-next-line
      this.$http.get(`/commentaire/${this.objetPublication._id}`, this.config).then((response) => {
        this.listeCommentaire = response.data;
      });
    },
    // Formattage de la date d'affichage
    dateCommentaire(date) {
      const dateString = new Date(date);
      const dateTxt = `${((dateString.getDate() < 10) ? '0' : '') + dateString.getDate()}/${((dateString.getMonth() < 10) ? '0' : '') + (dateString.getMonth() + 1)}/${dateString.getFullYear().toString().substr(-2)} à ${(dateString.getHours())}h${((dateString.getMinutes() < 10) ? '0' : '') + dateString.getMinutes()}`;
      return dateTxt;
    },
    envoiCommentaire() {
      if (this.texteEnvoi.trim() !== '') {
        this.$http.post('/commentaire/', {
          // eslint-disable-next-line
          idPublication: this.objetPublication._id,
          commentaire: this.texteEnvoi,
        }, this.config).then(() => {
          // eslint-disable-next-line
          this.$socket.emit('UPDATE_COMMENTAIRE', this.objetPublication._id);
          this.texteEnvoi = '';
        });
      }
    },
  },
  created() {
    this.nombreAime = Number(this.objetPublication.listeUtilisateurAime.length);
    if (this.objetPublication.listeUtilisateurAime
      .indexOf(this.$store.state.utilisateur.nomUtilisateur) !== -1) {
      this.statusAime = true;
    } else {
      this.statusAime = false;
    }
    this.afficheCommmentaire();
  },
};
</script>


<style lang="scss">
section.une-publication {
  background-color: #fff1e2;
  #popup {
    display: none;
  }
  div.publication {
    width: 900px;
    margin: 0 auto;
    overflow: auto;
    .titre-une-publication {
      h1 {
        display: inline-block;
        width: calc(100% - 43px);
        padding-bottom: 5px;
      }
      b {
        width: 23px;
        font-size: 23px;
        float: right;
        color: rgb(161, 161, 161);
        &:hover {
          color: red;
          cursor: pointer;
        }
      }
    }
    div.publication-image {
      display: block;
      border: 1px solid black;
      background-repeat: no-repeat;
      background-color: white;
      div.shadow {
        transform: translate(5px, 5px);
        filter: blur(5px);
        overflow: hidden;
        width: 519px;
        height: 521px;
        background-size: 531px 100%;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.2);
      }
      width: 59%;
      height: 533px;
      float: left;
      img {
        position: absolute;
        width: 529px;
        height: 531px;
        object-fit: contain;
        display: block;
        margin: 0 auto;
        z-index: 0;
      }
    }
    div.publication-interaction {
      display: block;
      height: 100%;
      float: right;
      width: 39%;
      border: 1px solid black;
      background-color: #f8f8fc;
      div.description-publication {
        height: 140px;
        overflow: hidden;
        overflow-y: scroll;
        margin-bottom: 5px;
        border-bottom: 1px solid black;
        padding: 10px;
        text-align: justify;
        overflow-wrap: break-word;
      }
      > span {
        text-align: center;
        display: block;
        width: 100%;
        &:last-of-type {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -o-user-select: none;
          user-select: none;
        }
      }
      span.hoverable {
        cursor: pointer;
      }
      div.publication-bouton {
        button {
          margin: 0 5px;
          width: calc(50% - 10px);
        }
        width: 100%;
      }
      input {
        margin: 10px 5px 10px;
        width: calc(100% - 10px) !important;
        &:focus {
          animation-name: focusCommentaire;
          animation-timing-function: ease-out;
          animation-duration: 1s;
        }
      }
      .publication-commentaire {
        height: 250px;
        overflow: hidden;
        overflow-y: scroll;
        border-top: 1px solid black;
        span {
          margin: 5px;
          padding: 8px;
          display: block;
          overflow: auto;
          overflow-wrap: break-word;
          border-bottom: 1px solid rgb(204, 204, 204);
          p {
            width: 100%;
            text-align: justify;
            display: inline-block;
          }
          button {
            background-color: #f8f8fc;
            margin-left: 5px;
            vertical-align: top;
            float: right;
            color: red;
            border: 0 !important;
            padding: 0 3px !important;
            border-radius: 0 !important;
            &:hover {
              color: white;
            }
          }

          &:last-child {
            border-bottom: none;
          }
          div.commentaire-date {
            padding-right: 1px;
            width: 100%;
            text-align: right;
            font-style: italic;
            font-size: 15px;
            color: rgb(107, 107, 107);
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 920px) {
  section.une-publication {
    min-width: 320px;
    div.publication {
      .titre-une-publication {
        h1 {
          padding: 5px;
        }
      }
      width: 96%;
      div.publication-image {
        div.shadow {
          display: none;
        }
        height: auto !important;
        border-bottom: none;
        width: 100%;
        img {
          position: relative !important;
          margin: 0 auto;
          height: auto;
          max-width: 100%;
        }
      }
      div.publication-interaction {
        width: 100%;
        .publication-commentaire {
          height: 100%;
          max-height: 250px;
        }
      }
    }
  }
}
</style>
