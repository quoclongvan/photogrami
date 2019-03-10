import axios from 'axios';

export default {
  tokenVide() {
    const token = JSON.parse(localStorage.getItem('token'));

    if (token) {
      return false;
    }
    this.deconnexion();
    return true;
  },

  verifieToken() {
    // Regarde si le Token est valide: appartient à un utilisateur, sinon déconnecte
    if (JSON.parse(localStorage.getItem('token')) != null) {
      const config = {
        headers: { 'Content-Type': 'application/json', 'x-auth-token': JSON.parse(localStorage.getItem('token')) },
      };
      axios.get('/api/compte/moi', config).then(() => { }).catch(() => {
        this.deconnexion();
        this.redirect();
      });
    }
  },

  redirect() {
    window.location.replace('/');
    window.location.reload();
  },

  deconnexion() {
    localStorage.removeItem('token');
    localStorage.removeItem('conversation');
  },
};
