<template>
<div class="popup" v-if="idCommentaire" @click="fermerPopupExterieur">
  <div class="modif-photo-profil">
    <section>
      <h2 id="popup" @click="fermerPopup"><font-awesome-icon icon="angle-left"/></h2>
      <h1>Supprimer le commentaire?</h1>
      <span>Voulez-vous vraiment supprimer le commentaire? Cette action est irréversible</span>
      <div>
        <button @click="fermerPopup">Annuler</button>
        <button @click="supprimeCommentaire">Supprimer</button>
      </div>
    </section>
  </div>
</div>
</template>

<style lang="scss" scoped>
div.popup {
  z-index: 3;
  background-color: transparent !important;
  > div {
    -webkit-box-shadow: 0 0 5px 2px rgb(0, 0, 0);
    -moz-box-shadow: 0 0 5px 2px rgb(0, 0, 0);
    box-shadow: 0 0 5px 2px rgb(0, 0, 0);
  }
}
</style>


<script>
export default {
  props: {
    idCommentaire: {
      type: String,
      required: false,
    },
    idPublication: {
      type: String,
      required: false,
    },
  },
  methods: {
    fermerPopup() {
      this.$emit('close');
    },
    // Lorsque l'utilisateur n'utilise pas le bouton pour fermer, mais clique à côté
    fermerPopupExterieur(e) {
      if (e.target.className === 'popup') {
        this.$emit('close');
      }
    },
    supprimeCommentaire() {
      this.$http.delete(`/commentaire/${this.idCommentaire}`, this.config).then(() => {
        this.$socket.emit('UPDATE_COMMENTAIRE', this.idPublication);
        this.$emit('close');
      });
    },
  },
};
</script>
