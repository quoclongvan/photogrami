const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send("Accès refusé. Aucun token n'a été transmis en paramètre.")

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.compte = decoded;
    next();
  }
  catch (err) {
    res.status(400).send('Token invalide.');
  }
}