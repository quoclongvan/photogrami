const Joi = require('joi');
const mongoose = require('mongoose');

const schemaMessage = new mongoose.Schema({
  auteur: String,
  idConversation: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', schemaMessage);

function validerMessage(message){
  const schema = {
    idConversation: Joi.string().min(3).required(),
    message: Joi.string().min(1).required(),
  }
  
  return Joi.validate(message, schema);
}

exports.schemaMessage = schemaMessage;
exports.validerMessage = validerMessage;
exports.Message = Message;