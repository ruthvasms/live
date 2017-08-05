/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');


module.exports = {
  ORG_ADMIN: 1,
  INST_ADMIN: 2,
  PARENT: 3,
  STUDENT:4,
  schema: true,
  attributes: {
    username:{
      type: 'string',
      required: false
    },
    email:{
      type: 'email',
      required: true
    },
    mobile:{
      type:'string',
      required: false
    },
    password:{
      type: 'string',
      required: true
    },
    firstName:{
      type: 'string',
      required: true
    },
    lastName:{
      type: 'string',
      required: true
    },
    fullName: function () {
      return this.firstName+' '+this.lastName;
    },
    is_org_admin:{
      type: 'boolean',
      required: true
    },
    is_inst_admin:{
      type: 'boolean',
      required: true
    },
    is_parent:{
      type: 'boolean',
      required: true
    },
    is_student:{
      type: 'boolean',
      required: true
    },
    org_id:{
      type: 'string',
      required: false
    },
    inst_id:{
      type: 'string',
      required: false
    }
  },

  beforeCreate: function(values, next) {
    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      if (values.is_org_admin && values.org_name != null){
        Organisation.create({
          name: values.org_name
        }).exec(function (err, createdRecord){
          delete values.org_name;
          values.org_id = createdRecord.id;
          next();
        });
      }else{
        next();
      }
    });
  },
  comparePassword(password, encryptedPassword) {

    return new Promise(function(resolve, reject) {
      bcrypt.compare(password, encryptedPassword, (err, match) => {
        if (err) {
          sails.log.error(err);
          return reject("Something went wrong!");
        }
        if (match) return resolve();
        else return reject("Mismatch passwords");
      });
    });
  },
  checkPermission(user, permission){
    return new Promise(function(resolve, reject) {
      var permitted = false;
      switch (permission) {
        case User.ORG_ADMIN:
          if (user.is_org_admin) permitted = true;
          break;
        case User.INST_ADMIN:
          if (user.is_inst_admin) permitted = true;
          break;
        case User.PARENT:
          if (user.is_parent) permitted = true;
          break;
        case User.STUDENT:
          if (user.is_student) permitted = true;
          break;
      }
      if (permitted){
        return resolve();
      }else{
        return reject();
      }
    });
  }

};
