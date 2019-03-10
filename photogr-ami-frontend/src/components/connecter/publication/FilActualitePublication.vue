<template>
<div>
  <popup-supprimer-publication :idPublication="supprimePublication"
  @close="supprimePublication = null"></popup-supprimer-publication>
  <popup-supprimer-commentaire :idCommentaire="supprimeCommentaire"
  :idPublication="publicationSelection"
  @close="supprimeCommentaire = null"></popup-supprimer-commentaire>
  <popup-nouvelle-publication :affiche="popupNouvellePublication"
    @close="popupNouvellePublication = false"></popup-nouvelle-publication>
  <popup-liste :typeListe="typeListe"
  :listeUtilisateur="listeAime" @close="typeListe = null">
  </popup-liste>
  <section class="fil-actualite">
    <div class="selection-fil-actualite no-selection">
      <div class="radius-left radius-right" title="Publier une nouvelle publication"
      @click="popupNouvellePublication = true">
        <font-awesome-icon icon="plus-square" /> Publication
      </div>
      <div @click="changeOngletPublication(1)" title="Liste des publications de vos abonnements"
      :class="{'active': ongletAbonnement}" class="radius-left">
        Abonnement
      </div>
      <div @click="changeOngletPublication(2)" title="Liste des publications les plus populaires"
      :class="{'active': ongletPopulaire}" class="radius-right">
        Populaire
      </div>
    </div>
    <div v-if="ongletAbonnement">
      <div v-for="(publication, index) in listePublicationAbonnement"
      :key="publication._id" :value="index" class="background-publication">
        <affichage-une-publication :objetPublication="publication"
        @setIDPublication="supprimerPublication"
        @setIDCommentaire="supprimerCommentaire"
        @setListeAime="afficheListeAime"></affichage-une-publication>
      </div>
      <div class="aucune-publication fil" v-if="listePublicationAbonnement.length == 0">
        Il n'y a aucune publication à afficher, vous pouvez commencer
        à suivre les utilisateurs que vous connaissez.
      </div>
      <div class="page-selection" v-else>
        <div>
          Page
          <button :disabled="!boutonAbonnementPrecedentActive" title="Page précédente"
          @click="setPage(pageAbonnementActuel - 1, 1)">&nbsp;&#60;&nbsp;</button>
          <input @keyup.enter="setPage(pageAbonnementInput, 1)"
          type="number" min="1" v-model="pageAbonnementInput">
          <button :disabled="!boutonAbonnementSuivantActive" title="Page suivante"
          @click="setPage(pageAbonnementActuel + 1, 1)">&nbsp;&#62;&nbsp;</button>
        </div>
      </div>
    </div>
    <div v-if="ongletPopulaire">
      <div v-for="(publication, index) in listePublicationPopulaire"
      :key="publication._id" :value="index" class="background-publication">
        <affichage-une-publication :objetPublication="publication"
        @setIDPublication="supprimerPublication"
        @setIDCommentaire="supprimerCommentaire"
        @setListeAime="afficheListeAime"></affichage-une-publication>
      </div>
      <div class="aucune-publication fil" v-if="listePublicationPopulaire.length == 0">
        Il n'y a aucune publication à afficher.
      </div>
      <div class="page-selection" v-else>
        <div>
          Page
          <button :disabled="!boutonPopulairePrecedentActive" title="Page précédente"
          @click="setPage(pagePopulaireActuel - 1, 2)">&nbsp;&#60;&nbsp;</button>
          <input @keyup.enter="setPage(pagePopulaireInput, 2)"
          type="number" min="1" v-model="pagePopulaireInput">
          <button :disabled="!boutonPopulaireSuivantActive" title="Page suivante"
          @click="setPage(pagePopulaireActuel + 1, 2)">&nbsp;&#62;&nbsp;</button>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import AffichageUnePublication from '../../statique/AffichageUnePublication.vue';
import PopupNouvellePublication from '../../statique/PopupNouvellePublication.vue';
import PopupSupprimerPublication from '../../statique/PopupSupprimerPublication.vue';
import PopupSupprimerCommentaire from '../../statique/PopupSupprimerCommentaire.vue';
import PopupListe from '../../statique/PopupListe.vue';

export default {
  data() {
    return {
      ongletAbonnement: true,
      ongletPopulaire: false,
      popupNouvellePublication: false,
      listePublicationAbonnement: [],
      listePublicationPopulaire: [],
      supprimePublication: null,
      supprimeCommentaire: null,
      publicationSelection: null,
      pageAbonnementActuel: 1,
      pageAbonnementInput: 1,
      boutonAbonnementPrecedentActive: false,
      boutonAbonnementSuivantActive: false,
      pagePopulaireActuel: 1,
      pagePopulaireInput: 1,
      boutonPopulairePrecedentActive: false,
      boutonPopulaireSuivantActive: false,
      typeListe: null,
      listeAime: [],
    };
  },
  components: {
    AffichageUnePublication,
    PopupNouvellePublication,
    PopupSupprimerPublication,
    PopupSupprimerCommentaire,
    PopupListe,
  },
  // Se fait appeler lorsqu'un socket à été émise
  mounted() {
    this.socket.on('UPDATE_PUBLICATION_TOUT', () => {
      this.affichePublicationPopulaire();
    });
    this.socket.on('UPDATE_PUBLICATION_SPECIFIQUE', (utilisateur) => {
      if ((utilisateur === this.$store.state.utilisateur.nomUtilisateur)
      || (this.$store.state.utilisateur.listeAbonnement.indexOf(utilisateur) !== -1)) {
        this.affichePublicationAbonnement();
      }
    });
  },
  created() {
    Promise.resolve(this.$store.dispatch('infoUtilisateur')).then(() => {
      this.affichePublicationAbonnement();
      this.affichePublicationPopulaire();
    });
  },
  methods: {
    changeOngletPublication(ongletValeur) {
      if (ongletValeur === 1) {
        this.ongletAbonnement = true;
        this.ongletPopulaire = false;
      } else if (ongletValeur === 2) {
        this.ongletAbonnement = false;
        this.ongletPopulaire = true;
      }
    },
    affichePublicationAbonnement() {
      this.$http.get(`/publication/abonnement/${this.pageAbonnementInput}`, this.config).then((response) => {
        // Fait les validations nécessaires pour que l'utilise
        // ne navigue pas vers une page n'ayant aucune publication
        if (response.data.length === 0 && this.pageAbonnementInput !== 1) {
          this.pageAbonnementInput = this.pageAbonnementActuel;
        } else if (response.data.length !== 0) {
          this.listePublicationAbonnement = response.data;
          this.pageAbonnementActuel = this.pageAbonnementInput;
        } else if (response.data.length === 0 && this.pageAbonnementInput === 1) {
          this.listePublicationAbonnement = response.data;
        }
        if (this.pageAbonnementActuel === 1) {
          this.boutonAbonnementPrecedentActive = false;
        } else {
          this.boutonAbonnementPrecedentActive = true;
        }
      });
      this.$http.get(`/publication/abonnement/${this.pageAbonnementInput + 1}`, this.config).then((response) => {
        if (response.data.length === 0) {
          this.boutonAbonnementSuivantActive = false;
        } else {
          this.boutonAbonnementSuivantActive = true;
        }
      });
    },
    affichePublicationPopulaire() {
      this.$http.get(`/publication/populaire/${this.pagePopulaireInput}`, this.config).then((response) => {
        // Fait les validations nécessaires pour que l'utilise
        // ne navigue pas vers une page n'ayant aucune publication
        if (response.data.length === 0 && this.pagePopulaireInput !== 1) {
          this.pagePopulaireInput = this.pagePopulaireActuel;
        } else if (response.data.length !== 0) {
          this.listePublicationPopulaire = response.data;
          this.pagePopulaireActuel = this.pagePopulaireInput;
        } else if (response.data.length === 0 && this.pagePopulaireInput === 1) {
          this.listePublicationPopulaire = response.data;
        }
        if (this.pagePopulaireActuel === 1) {
          this.boutonPopulairePrecedentActive = false;
        } else {
          this.boutonPopulairePrecedentActive = true;
        }
      });
      this.$http.get(`/publication/populaire/${this.pagePopulaireInput + 1}`, this.config).then((response) => {
        if (response.data.length === 0) {
          this.boutonPopulaireSuivantActive = false;
        } else {
          this.boutonPopulaireSuivantActive = true;
        }
      });
    },
    supprimerPublication(value) {
      this.supprimePublication = value;
    },
    supprimerCommentaire(value, idPublication) {
      this.supprimeCommentaire = value;
      this.publicationSelection = idPublication;
    },
    afficheListeAime(value) {
      this.listeAime = value;
      this.typeListe = 'aime';
    },
    setPage(page, onglet) {
      if (onglet === 1) {
        if (Number(page) <= 0) {
          this.pageAbonnementInput = this.pageAbonnementActuel;
        } else {
          this.pageAbonnementInput = Number(page);
          this.affichePublicationAbonnement();
        }
      } else if (onglet === 2) {
        if (Number(page) <= 0) {
          this.pagePopulaireInput = this.pagePopulaireActuel;
        } else {
          this.pagePopulaireInput = Number(page);
          this.affichePublicationPopulaire();
        }
      }
    },
  },
};
</script>

<style lang="scss">
section.fil-actualite {
  padding-bottom: 0;
  div.selection-fil-actualite {
    margin-top: 20px;
    div:first-child {
      width: 140px;
      margin-right: 10px;
      background-color: rgb(253, 200, 175);
    }
    div:not(:first-child) {
      display: inline-block;
      width: calc(50% - 75px);
      border: 1px solid black;
      background-color: white;
      padding: 10px 0;
    }
  }
  div.fil {
    margin-top: 20px !important;
    text-align: center;
  }
}
div.aucune-publication {
  margin: 0px 10px;
}
div.page-selection {
  width: 200px;
  overflow: auto;
  margin: 10px auto;
  input {
    margin: 0 5px;
    width: 50px;
    text-align: center;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type=number] {
      -moz-appearance:textfield;
    }
  }
  button:disabled {
    background-color: rgb(175, 126, 33);
    color: black;
  }
}

@media only screen and (max-width: 920px) {
  div.background-publication {
    &:nth-child(even) {
      section.une-publication {
        background-color:#f5c38a;
      }
    }
  }
  div.page-selection {
    height: 85px;
  }
}
</style>
