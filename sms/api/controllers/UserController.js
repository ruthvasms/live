/**
* UserController
*
* @description :: Server-side logic for managing users
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {



  /**
  * `UserController.login()`
  */
  create(req, res) {
    const data = req.body;
    if (data.paasword != data.confirmPassowrd) return res.badRequest("Password not the same");
    if (!data.ord_id && !data.inst_id){
      res.status('406');
      return res.json({
        status: -406,
        message: "partial content!!"
      });
    }
    // User.beforeCreate(data,function(err){});

    User.findOne({
      or : [
        { username: data.username },
        { email: data.email }
      ]
    })
    .then((user) => {
      if(user){
        res.status('403');
        return res.json({
          status: -403,
          message: "User already exists!!"
        });
      }else{
        User.create(data)
        .then((user) => {
          res.status('201');
          res.json({
            status: 201,
            message: "User created!!"
          });
        })
        .catch((err) => {
          sails.log.error(err);
          return res.serverError("Something went wrong");
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });


  },
  login: function (req, res) {
    const data = req.body;
    if (data.username && data.password && data.loginas) {
      var username = data.username;
      var password = data.password;
      var loginas = data.loginas;
      var rand = function() {
        return Math.random().toString(36).substr(2); // remove `0.`
      };
      var token = function() {
        return rand() + rand(); // to make it longer
      };
      var tokenGen = null;
      User.findOne({
        or:[
          { username: username},
          { email: username}
        ]
      }).exec(function (err, user) {
        if (err){
          return res.negotiate(err);
        }else if (!user) {
          res.status('401');
          return res.json({
            status: -401,
            message: 'Invalid login!!'
          });
        }else if (user) {
          User.comparePassword(password, user.password)
          .then(() => {
            User.checkPermission(user, loginas)
            .then(() =>{
              var tokenGen = jwToken.issue({
                id: user.id,
                org_id: user.org_id,
                inst_id: user.inst_id
              });
              req.session.token = tokenGen;
              return res.json({
                token: tokenGen
              });
            })
            .catch((err) => {
              res.status('401');
              return res.json({
                status: -401,
                message: "You dont have permission to access this page!!"
              });
            });
          })
          .catch((err) => {
            return res.forbidden();
          });
        }
      });
    }else {
      res.status('400');
      return res.json({
        status: -400,
        message: "Details are not provided!!"
      });
    }

  }

};
