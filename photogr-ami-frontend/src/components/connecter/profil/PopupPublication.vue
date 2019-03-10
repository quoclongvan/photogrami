<template>
<div class="popup popup-publication" v-if="objetPublication" @click="fermerPopupExterieur">
  <affichage-une-publication :objetPublication="objetPublication"
  @setIDPublication="supprimerPublication"
  @setIDCommentaire="supprimerCommentaire"
  @setListeAime="afficheListeAime"
  @fermerPopup="fermerPopup"></affichage-une-publication>
</div>
</template>

<style lang="scss">
div.popup-publication {
  background-color: rgba(0, 0, 0, 0.85);
  > div {
    height: 100%;
    -webkit-box-shadow: none !important;
    -moz-box-shadow: none !important;
    box-shadow: none !important;
  }
}
div.popup {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow-y: scroll;
  margin: 0;
  section.une-publication {
    background-color: rgba(0, 0, 0, 0) !important;
    margin: 0;
    div.publication {
      width: 920px;
      padding: 10px 10px;
      background-color: #f8f8fc;
      h2 {
        display: inline-block !important;
        width: 20px;
        cursor: pointer;
        vertical-align: top;
      }
      h1 {
        text-align: center;
      }
      div.publication-image {
        background-color: #f8f8fc;
      }
    }
  }
  @media only screen and (max-width: 920px) {
    section.une-publication {
      min-width: 320px;
      div.publication {
        width: 100%;
      }
    }
  }
}
</style>

<script>
import AffichageUnePublication from '../../statique/AffichageUnePublication.vue';

export default {
  props: {
    objetPublication: {
      required: false,
      type: Object,
    },
  },
  components: {
    AffichageUnePublication,
  },
  methods: {
    fermerPopup() {
      this.$emit('close');
    },
    // Lorsque l'utilisateur n'utilise pas le bouton pour fermer, mais clique à côté
    fermerPopupExterieur(e) {
      if (e.target.className === 'une-publication') {
        this.$emit('close');
      }
    },
    supprimerPublication(value) {
      this.$emit('setIDPublication', value);
    },
    supprimerCommentaire(value, idPublication) {
      this.$emit('setIDCommentaire', value, idPublication);
    },
    afficheListeAime(value) {
      this.$emit('setListeAime', value);
    },
  },
};
</script>
