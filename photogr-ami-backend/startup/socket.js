const socket = require('socket.io');

module.exports = function(server) {
  let io = socket(server);

  io.on('connection', function(socket) {
    socket.on('UPDATE_CONVERSATION_MESSAGE', function(utilisateur) {
      io.emit('UPDATE_CONVERSATION_MESSAGE', utilisateur);
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_CONVERSATION_LISTE', function() {
      io.emit('UPDATE_CONVERSATION_LISTE');
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_PROFIL', function(utilisateur) {
      io.emit('UPDATE_PROFIL', utilisateur);
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_ABONNEMENT_STATUS', function(utilisateur1, utilisateur2) {
      io.emit('UPDATE_ABONNEMENT_STATUS', utilisateur1, utilisateur2);
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_PUBLICATION_SPECIFIQUE', function(utilisateur) {
      io.emit('UPDATE_PUBLICATION_SPECIFIQUE', utilisateur);
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_PUBLICATION_TOUT', function() {
      io.emit('UPDATE_PUBLICATION_TOUT');
    });
  });
  io.on('connection', function(socket) {
    socket.on('UPDATE_COMMENTAIRE', function(id) {
      io.emit('UPDATE_COMMENTAIRE', id);
    });
  });
  io.on('connection', function(socket) {
    socket.on('NOTIFICATION_CONVERSATION_MESSAGE', function(data, destinataire) {
      io.emit('NOTIFICATION_CONVERSATION_MESSAGE', data, destinataire);
    });
  });
}