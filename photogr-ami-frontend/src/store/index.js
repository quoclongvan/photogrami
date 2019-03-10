import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state() {
    return {
      utilisateur: [],
    };
  },
  actions: {
    infoUtilisateur({ commit }) {
      const config = {
        headers: { 'Content-Type': 'application/json', 'x-auth-token': JSON.parse(localStorage.getItem('token')) },
      };
      return axios.get('/api/compte/moi', config).then((response) => {
        commit('APPLY_USER_CHANGE', { compte: response.data });
      });
    },
  },
  mutations: {
    APPLY_USER_CHANGE(state, { compte }) {
      // eslint-disable-next-line
      state.utilisateur = compte;
    },
  },
});
