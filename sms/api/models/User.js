/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
'use strict';
const bcrypt = require('bcrypt');

module.exports = {

 attributes: {
    
 },

 // Here we encrypt password before creating a User
 beforeCreate(values, next) {
     bcrypt.genSalt(10, (err, salt) => {
         if (err) {
             sails.log.error(err);
             return next();
         }

         bcrypt.hash(values.password, salt, (err, hash) => {
             if (err) {
                 sails.log.error(err);
                 return next();
             }
             values.encryptedPassword = hash; // Here is our encrypted password
             return next();
         });
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
     }
 };
