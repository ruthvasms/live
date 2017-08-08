/**
* UserController
*
* @description :: Server-side logic for managing users
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {

  signup(req, res) {
    const data = req.body;
    if (data.password != data.confirmPassword){
      return res.json('400',{
        status: -400,
        message: "Bad Request!!"
      });
    }
    if ((!data.org_id && !data.org_name) || !data.inst_id){
      res.status('406');
      return res.json({
        status: -406,
        message: "partial content!!"
      });
    }

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
          return res.json('500', {
            status: -500,
            message: "Internal Server Error"
          });
        });
      }
    })
    .catch((err) => {
      sails.log.error(err);
      return res.json('500', {
        status: -500,
        message: "Internal Server Error"
      });
    });


  },
  login: function (req, res) {
    const data = req.body;
    if (data.username && data.password && data.loginas) {
      var username = data.username;
      var password = data.password;
      var loginas = data.loginas;
      User.findOne({
        or:[
          { username: username},
          { email: username}
        ]
      }).exec(function (err, user) {
        if (err){
          sails.log.error(err);
          return res.json('500', {
            status: -500,
            message: "Internal Server Error"
          });
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
                status: 200,
                message: "sucessfully logged in!!",
                token: tokenGen
              });
            })
            .catch((err) => {
              res.status('401');
              return res.json({
                status: -401,
                message: "Not Authorized Login!!"
              });
            });
          })
          .catch((err) => {
            return res.json('401',{
                status: -401,
                message: "Invalid Login!!"
            });
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
  },
  logout(req, res){
    if (req.session.token){
      delete req.session.token;
      return res.json({
        status: 200,
        message: "loggedout!!"
      });
    }else{
      return res.json('404', {
        status: -404,
        message: "No login found"
      });
    }

  },
  getUserProfile(req, res){
    var username = req.param('username');
    if (username){
      User.findOne({
        or:[
          { username: username},
          {email: username}
        ]
      })
      .then((user) => {
        if (!user){
          return res.json('404',{
            status: -404,
            message: "user doesn't exists!!"
          });
        } else {
          return res.json({
            status: 200,
            message: "User profile is retrieved!!",
            is_org_admin: user.is_org_admin,
            is_inst_admin: user.is_inst_admin,
            is_faculty: user.is_faculty,
            is_parent: user.is_parent,
            is_student: user.is_student
          });
        }
      })
      .catch((err) => {
        sails.log.error(err);
        return res.json('500', {
          status: -500,
          message: "Internal Server Error"
        });
      });
    }else{
      return res.json('400', {
        status: -400,
        message: "Bad Request!!"
      });
    }
  },

  checkAvailability(req, res){
    var criteria = req.param('criteria');
    if (criteria){
      User.findOne({
        or:[
          { username: criteria},
          {email: criteria}
        ]
      })
      .then((user) => {
        if (!user){
          return res.json('404',{
            status: -404,
            message: "user doesn't exists!!",
            available: true
          });
        } else {
          return res.json({
            status: 200,
            message: "user already exists!!",
            available: false
          });
        }
      })
      .catch((err) => {
        sails.log.error(err);
        return res.json('500', {
          status: -500,
          message: "Internal Server Error"
        });
      });
    }else{
      return res.json('400', {
        status: -400,
        message: "Bad Request!!"
      });
    }
  }

};
