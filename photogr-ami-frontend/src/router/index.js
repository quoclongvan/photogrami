import Vue from 'vue';
import Router from 'vue-router';
import PagePrincipale from '../components/deconnecter/PagePrincipale.vue';
import FilActualite from '../components/connecter/publication/FilActualitePublication.vue';
import Conversation from '../components/connecter/conversation/Conversation.vue';
import Profil from '../components/connecter/profil/Profil.vue';
import Recherche from '../components/connecter/recherche/RechercheUtilisateur.vue';
import Reglages from '../components/connecter/reglages/Reglages.vue';
import Erreur from '@/components/erreur/Erreur.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'page-principale',
      component: PagePrincipale,
    },
    {
      path: '/Conversation',
      component: Conversation,
    },
    {
      path: '/Conversation/:nom',
      component: Conversation,
      props: { nom: true },
    },
    {
      path: '/Profil',
      component: Profil,
    },
    {
      path: '/Profil/:nomutilisateur',
      component: Profil,
      props: { nomutilisateur: true },
    },
    {
      path: '/Recherche',
      component: Recherche,
    },
    {
      path: '/Recherche/:input',
      component: Recherche,
      props: { input: true },
    },
    {
      path: '/FilActualite',
      component: FilActualite,
    },
    {
      path: '/Reglages',
      component: Reglages,
    },
    {
      path: '/Page-introuvable',
      component: Erreur,
    },
    {
      path: '*',
      redirect: '/Page-introuvable',
    },
  ],
});
