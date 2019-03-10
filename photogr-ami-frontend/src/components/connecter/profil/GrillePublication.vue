<template>
<ul>
  <li v-for="(publication, index) in liste" :key="index"
  :value="index" @click="ouvrirPopup(index)">
    <img draggable="false" :src="`/${publication.photo}`"
    :alt="`Publication de ${publication.auteur}`" class="publication-profil-image">
  </li>
</ul>
</template>

<script>
export default {
  props: {
    liste: Array,
  },
  watch: {
    // eslint-disable-next-line
    liste: function () {
      if (this.$parent.objetPublication !== null) {
        this.ouvrirPopup(this.currentIndex);
      }
    },
  },
  data() {
    return {
      currentIndex: null,
    };
  },
  methods: {
    ouvrirPopup(index) {
      this.currentIndex = index;
      this.$emit('setObjetPublication', this.liste[index]);
    },
  },
};
</script>
