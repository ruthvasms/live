'use strict';
module.exports = (req, res, next) => {
  let token;


  if (req.session && req.session.token) {
    token = req.session.token;
    if (token.length <= 0) return res.json(401, {err: 'Format is Authorization: Bearer [token]'});

  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.json(401, {
      status: -401,
      err: 'Not logged in!!'
    });
  }

  jwToken.verify(token, function (err, token) {
    if (err) return res.json(401, {err: 'Invalid Token!'});
    req.token = token; // This is the decrypted token or the payload you provided
    next();
  });
};
