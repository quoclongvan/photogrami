const express = require('express');
const cors = require('cors');
const comptes = require('../routes/comptes');
const conversations = require('../routes/conversations');
const messages = require('../routes/messages');
const publications = require('../routes/publications');
const authentication = require('../routes/authentication');
const commentaires = require('../routes/commentaires');

// Cours en ligne de Node.JS pour la structure générale, mais avec modification

module.exports = function(app) {
  app.use('/photo-profil', express.static('photo-profil'));
  app.use('/photo-publication', express.static('photo-publication'));
  app.use('/', express.static('dist'));
  app.use(express.json());
  app.use(cors());
  app.use('/api/compte', comptes);
  app.use('/api/authentication', authentication);
  app.use('/api/conversation', conversations);
  app.use('/api/message', messages);
  app.use('/api/publication', publications);
  app.use('/api/commentaire', commentaires);
  
  // Nécessaire pour attraper l'erreur d'une image trop large
  app.use(function(err, req, res, next) {
    res.status(500);
    res.end('Votre image doit être de type JPEG ou PNG et ne peut pas dépasser 5 Mo');
  });
  app.get('*', function(req, res) {
    res.redirect('/');
  });
}