import Vue from 'vue';
import io from 'socket.io-client';
import VueSocketio from 'vue-socket-io';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
// eslint-disable-next-line
import { faHome, faSearch, faPlusSquare, faEnvelope, faUser, faCameraRetro, faCog, faAngleLeft, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store';
import authService from './services/authentication-service';

library.add(faHome, faSearch, faPlusSquare, faEnvelope,
  faUser, faCameraRetro, faCog, faAngleLeft, faBan);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.prototype.$http = axios.create({
  baseURL: '/api/',
});
Vue.prototype.socket = io('/');
Vue.prototype.config = {
  headers: { 'Content-Type': 'application/json', 'x-auth-token': JSON.parse(localStorage.getItem('token')) },
};

router.beforeEach((to, from, next) => {
  authService.verifieToken();
  const deconnecte = authService.tokenVide(); // Retourne faux si l'utilisateur est connecté
  const navigateToPath = to.path === '/';
  if (deconnecte && navigateToPath) { // S'il n'est pas connecté et visite ces pages
    next();
  } else if (!deconnecte && navigateToPath) { // S'il est connecté et visite ces pages
    next('/FilActualite');
  } else if (!deconnecte) { // S'il est connecté
    next();
  } else { // S'il n'est pas connecté
    next('/');
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

Vue.use(VueSocketio, '/');
