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
  initialize: function() {
    // this.on('creating', function(model, attrs, {username, password}) {
    //   var username = model.attributes.username;
    //   var password = model.attributes.password;
    //   bcrypt.hash(password, null, null, function(err, hash) {
    //     var user = new User({ username: username, password: hash })
    //     user.save().then(function(newUser) {
    //       console.log("Successfully added a new user", newUser);
    //     });
    //   });
    // });
  }
});

module.exports = User;