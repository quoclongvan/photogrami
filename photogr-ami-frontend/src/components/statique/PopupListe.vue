<template>
<div class="popup" v-if="typeListe" @click="fermerPopupExterieur">
  <div class="liste-abonnement">
    <section>
      <h2 id="popup" @click="fermerPopup"><font-awesome-icon icon="angle-left"/></h2>
      <h1 v-if="typeListe === 'abonnés' || typeListe === 'abonnement'">Liste d'{{ typeListe }}</h1>
      <h1 v-else>Liste de mention j'aime</h1>
      <ul class="liste-recherche" v-if="listeUtilisateur.length === 0">
        <li id="listeVide" v-if="typeListe === 'abonnés'
        || typeListe === 'abonnement'">Aucun {{ typeListe }}</li>
        <li id="listeVide" v-else>Aucun mention j'aime</li>
      </ul>
      <ul class="liste-recherche" v-else>
        <router-link :to="`/Profil/${utilisateur}`" v-for="(utilisateur, index) in listeUtilisateur"
      :key="index" :value="index">
          <li>{{ utilisateur }}</li>
        </router-link>
      </ul>
    </section>
  </div>
</div>
</template>

<style lang="scss">
div.popup {
  > div {
    -webkit-box-shadow: 0 0 5px 2px rgb(0, 0, 0);
    -moz-box-shadow: 0 0 5px 2px rgb(0, 0, 0);
    box-shadow: 0 0 5px 2px rgb(0, 0, 0);
  }
  div.liste-abonnement, div.modif-photo-profil {
    width: 630px;
    padding: 15px 15px 20px;
    background-color: #fff1e2;
    margin: 40px auto;
    border-radius: 20px;
    section {
      padding: 0;
      min-width: 0px;
      h2 {
        display: inline-block !important;
        width: 20px;
        cursor: pointer;
        vertical-align: top;
      }
      h1 {
        display: inline-block;
        width: calc(100% - 40px);
        text-align: center;
      }
      ul.liste-recherche {
        width: 600px;
        border: none;
        max-height: 70vh;
        overflow: hidden;
        overflow-y: scroll;
        margin: 10px 0 0 !important;
        background-color: transparent;
        border-radius: 20px;
        li {
          background-color: #f8f8fc;
          height: 60px;
          line-height: 60px;
          padding: 0 10px;
          border: 1px solid black;
          &#listeVide {
            border-radius: 20px;
            cursor: unset;
          }
        }
        a {
          &:first-child {
            li {
              border-top-left-radius: 20px;
              border-top-right-radius: 20px;
            }
          }
          &:last-child {
            li {
              border-bottom-left-radius: 20px;
              border-bottom-right-radius: 20px;
            }
          }
        }
      }
    }
  }
}
@media only screen and (max-width: 630px) {
  div.liste-abonnement, div.modif-photo-profil {
    width: 96% !important;
    ul.liste-recherche {
      width: 100%;
    }
  }
}
</style>

<script>
export default {
  props: {
    typeListe: {
      required: false,
      type: String,
    },
    listeUtilisateur: {
      required: false,
      type: Array,
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
  },
};
</script>
