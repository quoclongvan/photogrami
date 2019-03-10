<template>
<div class="popup" v-if="affiche" @click="fermerPopupExterieur">
  <div class="modif-photo-profil">
    <section>
      <h2 id="popup" @click="fermerPopup"><font-awesome-icon icon="angle-left"/></h2>
      <h1>Modifier la photo de profil</h1>
      <span>Sélectionner une nouvelle photo:</span>
      <input type="file" @change="changementImage" accept="image/*">
      <span :class="{'erreur-fort': erreurImage}">L'image doit être de type JPEG
        ou PNG et ne doit pas dépasser 5 Mo</span>
      <div v-if="apercuImage">
        <h3>Aperçu de la photo:</h3>
        <div id="image"></div>
      </div>
      <div>
        <button @click="fermerPopup">Annuler</button>
        <button v-if="apercuImage" @click="sauvegarderPhoto">Sauvegarder</button>
        <button v-if="!photoDefaut" @click="retirerPhoto">Retirer la photo actuelle</button>
      </div>
      <div class="loader" v-if="chargementPhotoProfil"></div>
    </section>
  </div>
</div>
</template>

<style lang="scss">
div.modif-photo-profil {
  input, h3 {
    display: block;
    width: 90%;;
    margin: 10px auto;
    text-align: center;
  }
  span {
    display: block;
    margin: 20px 5% 0;
  }
  div#image {
    margin: 0 auto;
    border: 1px solid black;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background-size: cover;
    border: 2px solid rgb(248, 176, 140);
  }
  div {
    text-align: center;
    button {
      margin: 20px 5px 0;
    }
  }
  div.loader {
    margin-top: 0;
  }
}

.erreur-fort {
  font-weight: bold;
  color: red;
}

@media only screen and (max-width: 630px) {
  div#image {
    width: 100% !important;
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
    photoActuel: {
      type: String,
    },
  },
  watch: {
    affiche() {
      if (this.$store.state.utilisateur.photoProfil === 'photo-profil/photo-defaut.png') {
        this.photoDefaut = true;
      } else {
        this.photoDefaut = false;
      }
      this.imageSelectionner = null;
      this.apercuImage = false;
      this.erreurImage = false;
      this.chargementPhotoProfil = false;
    },
  },
  data() {
    return {
      photoDefaut: Boolean,
      imageSelectionner: null,
      apercuImage: false,
      erreurImage: false,
      chargementPhotoProfil: false,
    };
  },
  methods: {
    changementImage(event) {
      const reader = new FileReader();
      // eslint-disable-next-line
      if (event.target.files[0].type.match('image.*')) {
        this.apercuImage = true;
        // eslint-disable-next-line
        this.imageSelectionner = event.target.files[0];
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
    sauvegarderPhoto() {
      if (!this.chargementPhotoProfil) {
        this.erreurImage = false;
        this.chargementPhotoProfil = true;
        const formData = new FormData();
        formData.append('profilImage', this.imageSelectionner, this.imageSelectionner.name);
        this.$http.put('/compte/photo-de-profil/', formData, this.config).then(() => {
          this.fermerPopup();
          this.$socket.emit('UPDATE_PROFIL', this.$store.state.utilisateur.nomUtilisateur);
        }).catch(() => {
          this.chargementPhotoProfil = false;
          this.erreurImage = true;
        });
      }
    },
    // Si l'utilisateur à une photo de profil autre que celle par défaut, cela le lui retire
    retirerPhoto() {
      this.$http.put('/compte/retirer-photo-profil/', { }, this.config).then(() => {
        this.fermerPopup();
        this.$socket.emit('UPDATE_PROFIL', this.$store.state.utilisateur.nomUtilisateur);
      });
    },
  },
};
</script>
