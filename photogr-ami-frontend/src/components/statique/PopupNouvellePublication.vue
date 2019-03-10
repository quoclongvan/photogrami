<template>
<div class="popup" v-if="affiche" @click="fermerPopupExterieur">
  <div class="modif-photo-profil">
    <section>
      <h2 id="popup" @click="fermerPopup"><font-awesome-icon icon="angle-left"/></h2>
      <h1>Nouvelle publication</h1>
      <span>Sélectionner la photo:</span>
      <input type="file" @change="changementImage" accept="image/*">
      <span :class="{'erreur-fort': erreurImage}">L'image doit être de type JPEG
        ou PNG et ne doit pas dépasser 5 Mo</span>
      <div v-if="apercuImage">
        <h3>Aperçu de la photo:</h3>
        <div id="image"></div>
      </div>
      <textarea type="text" v-model="description" ref="description"
      placeholder="Entrez une description pour la photo.."/>
      <div>
        <button @click="fermerPopup">Annuler</button>
        <button v-if="apercuImage" @click="publierPhoto">Publier</button>
      </div>
      <div class="loader" v-if="chargementPublication"></div>
    </section>
  </div>
</div>
</template>

<style lang="scss" scoped>
div#image {
  width: 400px !important;
  height: 400px !important;
  border-radius: 0 !important;
  background-size: contain !important;
  background-color: #fff1e2;
  background-repeat: no-repeat;
  background-position: center;
  border: none !important;
}
textarea {
  resize: vertical;
  height: 100px;
  max-height: 300px;
  margin: 20px 5% 0;
  width: 90%;
  padding: 10px;
  font-size: 16px;
  border-radius: 20px;
  border: 1px solid black;
  &:focus {
    border: 1px solid rgb(248, 176, 140);
  }
}
div.loader {
  margin-top: 0;
}

@media only screen and (max-width: 630px) {
  div#image {
    width: 80% !important;
    height: 0% !important;
    padding-bottom: 100%;
  }
}
</style>


<script>
export default {
  props: {
    affiche: {
      type: Boolean,
    },
  },
  data() {
    return {
      imageSelectionner: null,
      apercuImage: false,
      description: '',
      chargementPublication: false,
      erreurImage: false,
    };
  },
  watch: {
    affiche() {
      this.imageSelectionner = null;
      this.apercuImage = false;
      this.description = '';
      this.erreurImage = false;
      this.chargementPublication = false;
    },
  },
  methods: {
    changementImage(event) {
      const reader = new FileReader();
      // eslint-disable-next-line
      if (event.target.files[0].type.match('image.*')) {
        this.apercuImage = true;
        // eslint-disable-next-line
        this.imageSelectionner = event.target.files[0];
        this.$refs.description.focus();
      } else {
        this.apercuImage = false;
        this.imageSelectionner = null;
      }
      reader.onload = (e) => {
        document.getElementById('image').style.backgroundImage = `url('${e.target.result}')`;
      };
      reader.readAsDataURL(this.imageSelectionner);
    },
    fermerPopup() {
      this.$emit('close');
    },
    // Lorsque l'utilisateur n'utilise pas le bouton pour fermer, mais clique à côté
    fermerPopupExterieur(e) {
      if (e.target.className === 'popup') {
        this.$emit('close');
      }
    },
    publierPhoto() {
      if (!this.chargementPublication) {
        this.erreurImage = false;
        this.chargementPublication = true;
        const formData = new FormData();
        formData.append('publicationImage', this.imageSelectionner, this.imageSelectionner.name);
        if (this.description.trim() !== '') {
          formData.append('description', this.description);
        }
        this.$http.post('/publication/', formData, this.config).then(() => {
          this.fermerPopup();
          this.$socket.emit('UPDATE_PROFIL', this.$store.state.utilisateur.nomUtilisateur);
          this.$socket.emit('UPDATE_PUBLICATION_SPECIFIQUE', this.$store.state.utilisateur.nomUtilisateur);
          this.$socket.emit('UPDATE_PUBLICATION_TOUT');
        }).catch(() => {
          this.chargementPublication = false;
          this.erreurImage = true;
        });
      }
    },
  },
};
</script>
