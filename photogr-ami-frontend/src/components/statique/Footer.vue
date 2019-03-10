<template>
<footer v-if="utilisateurConnecte">
  <ul class="barre-navigation">
    <router-link to="/FilActualite"><li><font-awesome-icon icon="home" /></li></router-link>
    <router-link to="/Profil"><li><font-awesome-icon icon="user" /></li></router-link>
    <router-link to="/Conversation"><li><font-awesome-icon icon="envelope" /></li></router-link>
    <router-link to="/Reglages"><li><font-awesome-icon icon="cog" /></li></router-link>
  </ul>
</footer>
</template>

<script>
import authService from '../../services/authentication-service';

export default {
  data() {
    return {
      utilisateurConnecte: false,
    };
  },
  created() {
    this.utilisateurConnecte = this.verifieUtilisateurConnecte();
  },
  methods: {
    verifieUtilisateurConnecte() {
      const bool = authService.tokenVide();
      return !bool;
    },
  },
};
</script>

<style lang="scss">

footer {
  border-top: 1px solid rgb(177, 177, 177);
  position: fixed;
  bottom: 0;
  height: 40px;
  width: 100%;
  min-width: 320px;
  ul.barre-navigation {
    background-color: #fad2a8;
    li {
      line-height: 40px;
      font-size: 30px;
      text-align: center;
      width: 25%;
      display: inline-block;
      color: rgb(66, 65, 65);
      &:hover, &:active {
        background-color: rgb(248, 176, 140);
        cursor: pointer;
        color: black;
      }
    }
  }
}
@media only screen and (min-width: 601px) {
  footer {
    display: none;
  }
}
</style>
