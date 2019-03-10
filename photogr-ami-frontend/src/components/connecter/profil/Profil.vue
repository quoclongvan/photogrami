<template>
<div>
  <popup-supprimer-publication :idPublication="supprimePublication"
  @close="supprimePublication = null, objetPublication = null"></popup-supprimer-publication>
  <popup-supprimer-commentaire :idCommentaire="supprimeCommentaire"
  :idPublication="publicationSelection"
  @close="supprimeCommentaire = null"></popup-supprimer-commentaire>
  <popup-publication :objetPublication="objetPublication"
  @close="objetPublication = null" @setIDPublication="supprimerPublication"
  @setIDCommentaire="supprimerCommentaire"
  @setListeAime="afficheListeAbonnement"></popup-publication>
  <popup-liste :typeListe="typeListeAbonnement"
  :listeUtilisateur="listeAbonnementAAfficher" @close="typeListeAbonnement = null">
  </popup-liste>
  <popup-photo-profil :affiche="popupPhotoProfil" :photoActuel="photoPath"
  @close="popupPhotoProfil = false"></popup-photo-profil>
  <popup-nouvelle-publication :affiche="popupNouvellePublication"
  @close="popupNouvellePublication = false"></popup-nouvelle-publication>
  <section class="profil">
    <div class="entete-profil">
      <div class="photo-profil" :style="`background-image: url(${photoPath};`"
      @click="(notreProfil) ? popupPhotoProfil = true : popupPhotoProfil = false">
      <div class="plus no-selection" v-if="notreProfil"
      title="Changer la photo de profil">+</div></div>
      <div class="information-profil" v-if="profilExiste">
        <ul>
          <li><b>{{ prenom }} {{ nom }}</b></li>
          <li><b>@{{ nomUtilisateur }}</b></li>
          <li>
            <span @click="afficheListeAbonnement(1)" title="Voir la liste des abonnés">
              {{ listeAbonnes.length }} abonné<span v-if="listeAbonnes.length > 1">s</span>
            </span> -
            <span @click="afficheListeAbonnement(2)" title="Voir la liste des abonnements">
              {{ listeAbonnement.length }} abonnement
            </span>
          <li v-if="notreProfil">
            <button @click="afficheProfilModification"
            v-if="!afficheModifProfil" class="espace-droite"
            title="Modifier votre profil">Modifier profil</button>
            <button @click="popupNouvellePublication = true"
            title="Publier une nouvelle publication">Nouvelle publication</button>
          </li>
          <li v-if="!notreProfil">
            <button class="espace-droite" v-if="!statusAbonnement"
            @click="changeStatusAbonnement()"
            :title="`S'abonner à ${nomUtilisateur}`">S'abonner</button>
            <button class="espace-droite" v-else
            @click="changeStatusAbonnement()"
            :title="`Se désabonner de ${nomUtilisateur}`">Se désabonner</button>
            <button @click="creerConversation()"
            :title="`Envoyer un message à ${nomUtilisateur}`">Envoyer un message</button>
          </li>
        </ul>
      </div>
      <div class="information-profil" v-else>
        <ul>
          <li><b>Erreur</b></li>
          <li>Le profil recherché n'existe pas</li>
          <br/>
          <li>
            <router-link to="/Profil">
              <button>Retourner à votre profil</button>
            </router-link>
          </li><br/>
        </ul>
      </div>
    </div>
    <div class="selection-page-profil" v-if="profilExiste">
      <div @click="changeOngletProfil(1)" title="Publication de l'utilisateur"
      :class="{'active': ongletPublication}" class="no-selection radius-left">
        Publication
      </div>
      <div @click="changeOngletProfil(2)" title="Information de l'utilisateur"
      :class="{'active': ongletInfoProfil}" class="no-selection">
        À propos
      </div>
      <div @click="changeOngletProfil(3)" title="Publication aimées par l'utilisateur"
      :class="{'active': ongletFavoris}" class="no-selection radius-right">
        Favoris
      </div>
    </div>
    <div class="contenu-profil" v-if="profilExiste">
      <div class="publication-profil" v-if="ongletPublication">
        <grille-publication :liste="listePublication" v-if="listePublication.length > 0"
        @setObjetPublication="setObjetPublication"></grille-publication>
        <div class="aucune-publication" v-else>
          Cet utilisateur n'a aucune publication.
        </div>
      </div>

      <div class="a-propos-profil" v-if="ongletInfoProfil">
        <div class="a-propos-section">
          <div class="a-propos-titre">Membre depuis</div>
          <div class="a-propos-info">{{ dateCreation }}</div>
        </div>
        <div class="a-propos-section">
          <div class="a-propos-titre">Description</div>
          <div class="a-propos-info" v-if="!afficheModifProfil">{{ description }}</div>
          <div class="a-propos-info" v-else>
            <textarea class="a-propos-info-modif" type="text" v-model="description"/>
          </div>
        </div>
        <div class="a-propos-section">
          <div class="a-propos-titre">Nombre de publications</div>
          <div class="a-propos-info">{{ listePublication.length }}</div>
        </div>
        <div class="a-propos-section">
          <div class="a-propos-titre">Nombre de photos aimées</div>
          <div class="a-propos-info">{{ listePublicationFavoris.length }}</div>
        </div>
        <div class="a-propos-section">
          <div class="a-propos-titre">Sexe</div>
          <div class="a-propos-info" v-if="!afficheModifProfil">{{ sexe }}</div>
          <div class="a-propos-info" v-else>
            <select name="sexe" v-model="sexe">
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
        <div class="a-propos-section">
          <div class="a-propos-titre">Site Internet</div>
          <div class="a-propos-info" v-if="!afficheModifProfil">
            <a :href="site" target="_blank">{{ site }}</a>
          </div>
          <div class="a-propos-info" v-else>
            <input class="a-propos-info-modif" type="text" v-model="site">
            <button v-if="afficheModifProfil" @click="sauvegarderAPropos">Sauvegarder</button>
            <button v-if="afficheModifProfil" @click="annuler()">Annuler</button>
          </div>
        </div>
      </div>

      <div class="publication-profil" v-if="ongletFavoris">
        <grille-publication :liste="listePublicationFavoris"
        v-if="listePublicationFavoris.length > 0"
        @setObjetPublication="setObjetPublication"></grille-publication>
        <div class="aucune-publication" v-else>
          Cet utilisateur n'a ajouté aucune publication dans ses favoris.
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import PopupPublication from './PopupPublication.vue';
import PopupListe from '../../statique/PopupListe.vue';
import PopupPhotoProfil from './PopupPhotoProfil.vue';
import PopupNouvellePublication from '../../statique/PopupNouvellePublication.vue';
import PopupSupprimerPublication from '../../statique/PopupSupprimerPublication.vue';
import PopupSupprimerCommentaire from '../../statique/PopupSupprimerCommentaire.vue';
import GrillePublication from './GrillePublication.vue';

export default {
  data() {
    return {
      ongletPublication: true,
      ongletInfoProfil: false,
      ongletFavoris: false,
      afficheModifProfil: false,
      objetPublication: null,
      notreProfil: Boolean,
      profilExiste: false,
      statusAbonnement: false,
      listeAbonnementAAfficher: null,
      typeListeAbonnement: null,
      popupPhotoProfil: false,
      popupNouvellePublication: false,
      listePublication: [],
      listePublicationFavoris: [],
      supprimePublication: null,
      supprimeCommentaire: null,
      publicationSelection: null,

      nomUtilisateur: String,
      prenom: String,
      nom: String,
      listeAbonnes: Array,
      listeAbonnement: Array,
      dateCreation: String,
      description: String,
      sexe: String,
      site: String,
      photoPath: '/photo-profil/photo-defaut.png',
    };
  },
  components: {
    GrillePublication,
    PopupPublication,
    PopupListe,
    PopupPhotoProfil,
    PopupNouvellePublication,
    PopupSupprimerPublication,
    PopupSupprimerCommentaire,
  },
  watch: {
    // Lorsque l'utilisateur est sur un profil, on effectue les
    // changements nécessaires lorsqu'il navigue vers un autre profil
    $route() {
      this.typeListeAbonnement = null;
      this.verifieProfil();
      this.afficheModifProfil = false;
      this.objetPublication = null;
    },
    // eslint-disable-next-line
    listePublicationFavoris: function () {
      if (this.listePublicationFavoris.length === 0 && this.ongletFavoris && this.notreProfil) {
        this.objetPublication = null;
      }
    },
  },
  // Se fait appeler lorsqu'un socket à été émise
  mounted() {
    this.socket.on('UPDATE_PROFIL', (utilisateur) => {
      if (this.$route.params.nomutilisateur !== undefined) {
        if (utilisateur === this.$route.params.nomutilisateur.toLowerCase()) {
          this.verifieProfil();
        }
      } else if (utilisateur === this.$store.state.utilisateur.nomUtilisateur) {
        this.verifieProfil();
      }
    });
    this.socket.on('UPDATE_ABONNEMENT_STATUS', (utilisateur1, utilisateur2) => {
      if (this.$route.params.nomutilisateur !== undefined) {
        if (utilisateur1 === this.$route.params.nomutilisateur.toLowerCase()
        || utilisateur2 === this.$route.params.nomutilisateur.toLowerCase()) {
          this.verifieProfil();
        }
      } else if (utilisateur1 === this.$store.state.utilisateur.nomUtilisateur
        || utilisateur2 === this.$store.state.utilisateur.nomUtilisateur) {
        this.verifieProfil();
      }
    });
  },
  methods: {
    changeOngletProfil(ongletValeur) {
      if (ongletValeur === 1) {
        this.ongletPublication = true;
        this.ongletInfoProfil = false;
        this.ongletFavoris = false;
        this.annuler();
      } else if (ongletValeur === 2) {
        this.ongletPublication = false;
        this.ongletInfoProfil = true;
        this.ongletFavoris = false;
      } else if (ongletValeur === 3) {
        this.ongletPublication = false;
        this.ongletInfoProfil = false;
        this.ongletFavoris = true;
        this.annuler();
      }
    },
    annuler() {
      if (this.notreProfil && this.afficheModifProfil) {
        this.afficheNotreProfil();
        this.afficheModifProfil = false;
      }
    },
    afficheProfilModification() {
      this.afficheModifProfil = true;
      this.changeOngletProfil(2);
    },
    sauvegarderAPropos() {
      this.$http.put('/compte/profil/', {
        description: this.description,
        sexe: this.sexe,
        site: this.site,
      }, this.config).then(() => {
        this.afficheModifProfil = false;
        this.$socket.emit('UPDATE_PROFIL', this.$store.state.utilisateur.nomUtilisateur);
      });
    },
    setObjetPublication(value) {
      this.objetPublication = value;
    },
    supprimerPublication(value) {
      this.supprimePublication = value;
    },
    supprimerCommentaire(value, idPublication) {
      this.supprimeCommentaire = value;
      this.publicationSelection = idPublication;
    },
    verifieProfil() {
      Promise.resolve(this.$store.dispatch('infoUtilisateur')).then(() => {
        if (this.$route.params.nomutilisateur === undefined) {
          this.notreProfil = true;
          this.profilExiste = true;
          this.afficheNotreProfil();
          this.affichePublication(this.$store.state.utilisateur.nomUtilisateur);
        } else if (this.$store.state.utilisateur.nomUtilisateur
          === this.$route.params.nomutilisateur.toLowerCase()) {
          this.notreProfil = true;
          this.profilExiste = true;
          this.afficheNotreProfil();
          this.affichePublication(this.$store.state.utilisateur.nomUtilisateur);
        } else {
          this.notreProfil = false;
          this.afficheAutreProfil();
          this.affichePublication(this.$route.params.nomutilisateur.toLowerCase());
        }
      });
    },
    afficheNotreProfil() {
      this.nomUtilisateur = this.$store.state.utilisateur.nomUtilisateur;
      this.prenom = this.$store.state.utilisateur.prenom;
      this.nom = this.$store.state.utilisateur.nom;
      this.listeAbonnes = this.$store.state.utilisateur.listeAbonnes;
      this.listeAbonnement = this.$store.state.utilisateur.listeAbonnement;
      this.dateCreation = this.dateFormat(this.$store.state.utilisateur.dateCreation);
      this.description = this.$store.state.utilisateur.description;
      this.sexe = this.$store.state.utilisateur.sexe;
      this.site = this.$store.state.utilisateur.site;
      this.photoPath = `/${this.$store.state.utilisateur.photoProfil}`;
    },
    afficheAutreProfil() {
      Promise.resolve(this.$http.get(`/compte/recherche-nom-utilisateur/${this.$route.params.nomutilisateur.toLowerCase()}`, this.config).then((response) => {
        this.profilExiste = true;
        this.nomUtilisateur = response.data.nomUtilisateur;
        this.prenom = response.data.prenom;
        this.nom = response.data.nom;
        this.listeAbonnes = response.data.listeAbonnes;
        this.listeAbonnement = response.data.listeAbonnement;
        this.dateCreation = this.dateFormat(response.data.dateCreation);
        this.description = response.data.description;
        this.sexe = response.data.sexe;
        this.site = response.data.site;
        this.photoPath = `/${response.data.photoProfil}`;
      }).catch(() => {
        this.profilExiste = false;
      })).then(() => {
        this.verifieStatusAbonnement();
      });
    },
    // Formattage de la date d'affichage
    dateFormat(d) {
      return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    creerConversation() {
      this.$http.post(`/conversation/${this.$route.params.nomutilisateur.toLowerCase()}`, {}, this.config).then((response) => {
        this.$socket.emit('UPDATE_CONVERSATION_LISTE');
        // eslint-disable-next-line
        localStorage.setItem('conversation', response.data._id);
        // eslint-disable-next-line
        this.$router.push(`/Conversation/${response.data._id}`);
      });
    },
    changeStatusAbonnement() {
      this.$http.put(`/compte/abonnement-utilisateur/${this.$route.params.nomutilisateur.toLowerCase()}`, { }, this.config).then(() => {
        this.$socket.emit('UPDATE_ABONNEMENT_STATUS', this.$store.state.utilisateur.nomUtilisateur, this.$route.params.nomutilisateur.toLowerCase());
      });
    },
    verifieStatusAbonnement() {
      if (this.listeAbonnes.indexOf(this.$store.state.utilisateur.nomUtilisateur) !== -1) {
        this.statusAbonnement = true;
      } else {
        this.statusAbonnement = false;
      }
    },
    afficheListeAbonnement(type) {
      if (type === 1) {
        this.typeListeAbonnement = 'abonnés';
        this.listeAbonnementAAfficher = this.listeAbonnes;
      } else if (type === 2) {
        this.typeListeAbonnement = 'abonnement';
        this.listeAbonnementAAfficher = this.listeAbonnement;
      } else {
        this.typeListeAbonnement = 'aime';
        this.listeAbonnementAAfficher = type;
      }
    },
    affichePublication(nom) {
      this.$http.get(`/publication/utilisateur/${nom}`, this.config).then((response) => {
        this.listePublication = response.data;
      });
      this.$http.get(`/publication/favoris/${nom}`, this.config).then((response) => {
        this.listePublicationFavoris = response.data;
      });
    },
  },
  created() {
    this.verifieProfil();
  },
};
</script>


<style lang="scss">
section.profil {
  padding-top: 60px;
  min-width: 320px;
  padding-bottom: 0;
  div.entete-profil {
    margin: 15px auto;
    padding: 0 10px;
    max-width: 700px;
    overflow: auto;
    div.photo-profil {
      float: left;
      width: 160px;
      height: 160px;
      border-radius: 125px;
      background-color: white;
      background-size: cover;
      border: 2px solid rgb(248, 176, 140);
      cursor: pointer;
      div.plus {
        position: absolute;
        margin: 105px 0 0 120px;
        color: white;
        width: 40px;
        height: 40px;
        background-color: #0ca3ff;
        border-radius: 50%;
        font-size: 32px;
        line-height: 40px;
        text-align: center;
        font-weight: bold;
        font-family: Arial, Helvetica, sans-serif;
        -webkit-box-shadow: 2px 2px 5px 0px rgba(78, 78, 78, 0.5);
        -moz-box-shadow: 2px 2px 5px 0px rgba(78, 78, 78, 0.5);
        box-shadow: 2px 2px 5px 0px rgba(78, 78, 78, 0.5);
        &:hover {
          color: rgb(231, 231, 231);
        }
        &:active {
          background-color: #069af7;
          transform: translateY(1px);
        }
      }
    }
    div.information-profil {
      margin: 25px 20px 0 0;
      float: right;
      ul {
        list-style: none;
        li {
          padding: 2px 0;
          text-align: right;
          font-size: 16px;
          span {
            cursor: pointer;
          }
          button.espace-droite {
            margin-right: 10px;
          }
        }
      }
    }
  }
  div.contenu-profil {
    width: 100%;
    height: 100%;
    border-radius: 3px;
    margin: 0 auto;
    div.publication-profil, div.a-propos-profil {
      width: 930px;
      margin: 0 auto;
      padding: 20px 0;
      ul {
        list-style: none;
        li {
          cursor: pointer;
          margin-top: 30px;
          display: inline-block;
          width: 290px;
          height: 290px;
          border: 1px solid rgb(248, 176, 140);
          img.publication-profil-image {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            background-color: #f8f8fc;
          }
        }
        li:nth-child(3n), li:nth-child(3n-1) {
          margin-left: 30px;
        }
      }
    }
    div.a-propos-profil {
      padding: 20px !important;
      height: 100%;
      button {
        margin-top: 15px;
        float: right;
        margin-left: 5px;
      }
      div.a-propos-section {
        overflow: auto;
        padding: 10px 0;
        border-bottom: 1px solid black;
        &:last-of-type {
          border-bottom: none !important;
        }
        div.a-propos-titre {
          float: left;
          width: 100px;
          font-weight: bold;
        }
        div.a-propos-info {
          width: calc(100% - 120px);
          float: right;
          text-align: justify;
          overflow-wrap: break-word;
          textarea.a-propos-info-modif {
            resize: vertical;
            max-height: 200px;
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border-radius: 20px;
            border: 1px solid black;
            &:focus {
              border: 1px solid rgb(248, 176, 140);
            }
          }
          input.a-propos-info-modif {
            width: 100%;
          }
        }
      }
      div.a-propos-section:last-child {
        border-bottom: none;
      }
    }
  }
}
div.selection-page-profil, div.selection-fil-actualite {
  width: 60%;
  margin: 0 auto;
  text-align: center;
  div {
    display: inline-block;
    width: 33%;
    border: 1px solid black;
    background-color: white;
    padding: 10px 0;
    &:hover {
      cursor: pointer;
      background-color: rgb(248, 176, 140) !important;
    }
    &:active {
      background-color: rgb(248, 176, 140) !important;
      transform: translateY(1px);
    }
  }
}
div.selection-fil-actualite {
  width: 900px;
}
@media only screen and (max-width: 900px) {
  div.a-propos-profil {
    width: 100% !important;
  }
  div.publication-profil {
    width: 600px !important;
    ul {
      padding-bottom: 20px;
      li:nth-child(3n), li:nth-child(3n-1) {
        margin-left: 0px !important;
      }
      li:nth-child(2n) {
        margin-left: 20px !important;
      }
    }
  }
}
@media only screen and (max-width: 600px) {
  div.contenu-profil {
    width: 100%;
    div.a-propos-profil {
      margin-bottom: 30px !important;
    }
    div.publication-profil {
      width: 100% !important;
      ul {
        li:nth-child(2n) {
          margin-left: 0px !important;
        }
        li {
          margin: 0 !important;
          width: 32.66% !important;
          padding-top: 32.66% !important;
          height: 0 !important;
          position: relative !important;
          img {
            position: absolute !important;
            top: 0;
            left: 0;
          }
        }
        li:nth-child(3n), li:nth-child(3n-1) {
          margin-left: 1% !important;
        }
      }
    }
  }
}
@media only screen and (max-width: 900px) {
  div.selection-fil-actualite {
    width: 98% !important;
  }
}
@media only screen and (max-width: 567px) {
  div.entete-profil {
    div.photo-profil, div.information-profil {
      float: unset !important;
      margin: 0 auto !important;
    }
    div.information-profil {
      margin-top: 20px !important;
      text-align: center;
      li {
        text-align: center !important;
      }
    }
  }
  div.selection-page-profil {
    width: 100% !important;
  }
}
</style>
