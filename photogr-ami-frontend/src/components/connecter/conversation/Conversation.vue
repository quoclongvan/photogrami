<template>
<section class="conversation">
  <div class="liste-message" :class="{'invisibleMobile': mobileAfficheListeMessage}">
    <liste-message></liste-message>
  </div>
  <div class="boite-message" :class="{'invisibleMobile': !mobileAfficheListeMessage}">
    <affiche-un-message></affiche-un-message>
  </div>
</section>
</template>

<script>
import AfficheUnMessage from './AfficheUnMessage.vue';
import ListeMessage from './ListeMessage.vue';

export default {
  components: {
    AfficheUnMessage,
    ListeMessage,
  },
  data() {
    return {
      mobileAfficheListeMessage: false,
    };
  },
};
</script>

<style lang="scss">
section.conversation {
  height: 100%;
}
section.conversation > div > div {
  height: 100%;
}
</style>
