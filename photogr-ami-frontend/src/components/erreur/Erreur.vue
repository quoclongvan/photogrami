<template>
<section class="page-erreur">
  <div class="erreur-desc">
    <h1>Page indisponible</h1>
    <p>La page recherchée n'existe pas.
      <router-link to="/">Retourner à la page d'accueil</router-link>
    </p>
  </div>
</section>
</template>

<style lang="scss">
section.page-erreur {
  div.erreur-desc {
    width: 750px;
    margin: 20px auto 0;
    padding: 5px;
    h1 {
      margin-bottom: 15px;
    }
    a {
      margin-top: 15px;
      display: block;
      font-weight: bold;
      text-decoration: underline;
    }
  }
}
@media only screen and (max-width: 750px) {
  section.page-erreur {
    div.erreur-desc {
      width: 90%;
    }
  }
}
</style>
