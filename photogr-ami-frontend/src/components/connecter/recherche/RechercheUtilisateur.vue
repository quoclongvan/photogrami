<template>
<section class="recherche">
  <div class="haut-recherche" v-if="texteRecherche != '' && listeRecherche.length > 0">
   Résultat de la recherche pour <b>{{ texteRecherche }}</b>
  </div>
  <div class="haut-recherche" v-if="texteRecherche == ''">
    Cherchez dans la barre de recherche pour afficher des résultats
  </div>
  <div class="haut-recherche" v-if="texteRecherche != '' && listeRecherche.length === 0">
    Il n'y a aucun résultat pour <b>{{ texteRecherche }}</b>
  </div>
  <ul class="liste-recherche" v-if="texteRecherche != '' && listeRecherche.length > 0">
    <li v-for="(utilisateur, index) in listeRecherche" :key="utilisateur._id" :value="index">
      <router-link :to="`/Profil/${utilisateur.nomUtilisateur}`">
        <div class="img-utilisateur no-selection">
          <img :src="`/${utilisateur.photoProfil}`" alt="" draggable="false">
        </div>
        <div class="nom-utilisateur">
          {{ utilisateur.prenom }} {{ utilisateur.nom }}
        </div>
      </router-link>
    </li>
  </ul>
</section>
</template>

<script>
export default {
  data() {
    return {
      texteRecherche: '',
      listeRecherche: Array,
    };
  },
  watch: {
    $route() {
      this.afficheListe();
    },
  },
  created() {
    this.afficheListe();
  },
  methods: {
    // Liste des utilisateurs correspondant à la recherche
    afficheListe() {
      // Lorsque l'utilisateur est déjà sur la page recherche, on effectue les
      // changements nécessaires lorsqu'il fait une nouvelle recherche
      if (this.$route.params.input !== '' && this.$route.params.input !== undefined) {
        this.texteRecherche = this.$route.params.input.trim();
        this.$http.get(`/compte/recherche/${this.texteRecherche}`, this.config).then((response) => {
          this.listeRecherche = response.data;
        });
      } else {
        this.texteRecherche = '';
      }
    },
  },
};
</script>


<style lang="scss">
section.recherche {
  width: 100%;
  overflow-wrap: break-word;
  div.haut-recherche {
    margin: 20px auto 0;
    width: 800px;
    border: 1px solid black;
    padding: 5px;
    background-color: #f8f8fc;
  }
  ul.liste-recherche {
    margin: 0 auto;
    width: 800px;
    border: 1px solid black;
    list-style: none;
    background-color: #f8f8fc;
    li {
      border-bottom: 1px solid black;
      height: 120px;
      cursor: pointer;
    }
    li:last-child {
      border-bottom: none;
    }
    div {
      display: inline-block;
      height: 120px;
      vertical-align: top;
      &.img-utilisateur {
        width: 120px;
        border-right: 1px solid black;
        img {
          margin: 6px 6px;
          width: 106px;
          height: 106px;
          border: 1px solid black;
          border-radius: 50%;
        }
      }
      &.nom-utilisateur {
        width: calc(100% - 120px);
        padding-left: 5px;
        line-height: 120px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
@media only screen and (max-width: 800px) {
  div.haut-recherche, ul.liste-recherche {
    width: 100% !important;
  }
}
</style>
