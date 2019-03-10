const mongoose = require('mongoose');

const schemaConversation = new mongoose.Schema({
  listeUtilisateur: Array,
  dernierMessage: String,
  dernierUtilisateurEnvoi: String,
  dernierDate: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', schemaConversation);

exports.schemaConversation = schemaConversation;
exports.Conversation = Conversation;