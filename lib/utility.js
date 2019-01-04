var request = require('request');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.checkPasswordRequirements = function(password) {
  var requirements = {
    upperCases: 0,
    lowerCases: 0
  }

  for(var i = 0; i < password.length; i++) {
    if(password[i] === password[i].toUpperCase()) {
      requirements.upperCases++;
    } else if(password[i] === password[i].toLowerCase()) {
      requirements.lowerCases++
    }
  }
  if(requirements.upperCases === 0 || requirements.lowerCases === 0) {
    return false;
  } else {
    return true;
  }
}

exports.checkUser = function(req, res, next) {
  if(!req.session.user) {
    res.redirect('/login')
  } else {
    next();
  }
}
