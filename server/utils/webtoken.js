var config = require('../config/environment');
var jwt = require('jsonwebtoken');

function webtoken(req, res, next) {
  var token = req.body.token || req.query.key || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
  if (token) {
    // decode token
    jwt.verify(token, config.secrets.wt, function(err, decoded) {    
      if (err) {
        // res.redirect('/login');
        return res.status(401).send({ 
            success: false, 
            error: 'Invalid authorization key'
        });
      } else {
        // everything ok
        req.decoded = decoded;
        next();
      }
    });

  } else {
    return res.status(401).send({ 
        success: false, 
        error: 'Authorization key not provided' 
    });
  }
}
module.exports = webtoken;