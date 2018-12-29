var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',

  // checkUser: function(user) {
  //   bcrypt.compare(password, user.get('password'), function(err, match) {
  //     if(match) {
  //       res.redirect('/');
  //     } else {
  //       res.redirect('/signup');
  //     }
  //   });
  // }
});

module.exports = User;