var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var bcrypt = require('bcrypt-nodejs');


var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'coffee_now_andAlways',
  resave: false,
  saveUninitialized: true
}));


app.get('/', util.checkUser, 
  function(req, res) {
    res.render('index');
  });

app.get('/create', util.checkUser,
  function(req, res) {
    res.render('index');
  });


app.get('/links', util.checkUser,
  function(req, res) {

    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  });


app.post('/links', 
  function(req, res) {
    var uri = req.body.url;

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.sendStatus(404);
    }

    new Link({ url: uri }).fetch().then(function(found) {
      if (found) {
        res.status(200).send(found.attributes);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          Links.create({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          })
            .then(function(newLink) {
              res.status(200).send(newLink);
            });
        });
      }
    });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login',
  function(req, res) {
    res.render('login');
  });

app.get('/signup',
  function(req, res) {
    res.render('signup');
  });

app.get('/logout', 
  function(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });  
  });

app.post('/signup', function(req, res) {
  var uppercase = function(password) {
     password = req.body.password;
    for (var i = 0; i < password.length; i++) {
      if (password[i] === password[i].toUpperCase()) {
        return true;
      }
    }
    return false;
  }

  if(req.body.password.length >= 4 && uppercase) {
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
      var user = new User({ username: req.body.username, password: hash });
      user.save().then(function(newUser) {
        console.log('Successfully added a new user', newUser);
        req.session.regenerate(function() {
          req.session.user = newUser;
          res.redirect('/');
          console.log('req session user', req.session.user);
        });
      });
    });
  } else {
    res.redirect('/signup');
  }
});



app.post('/login', function(req, res) {
  var username = req.body.username;
  var enteredPassword = req.body.password;

  new User({username: username}).fetch().then(function(user) {
    if (user) {
      
      bcrypt.compare(enteredPassword, user.get('password'), function(err, passwordsDoMatch) {
        if (passwordsDoMatch) {
          req.session.regenerate(function() {
            console.log('passwords Do Match!! You May Proceed!');
            req.session.user = user;
            res.redirect('/');
          });          
        } else {
          console.log('Password Do NOT match, try again!');
          res.redirect('/');
        }
      });
    } else {
      console.log('Username not found, sign up please.');
      res.redirect('/login');
    }
  });
  // db.knex.select('username', 'password').from('users').then(function(user) {
  //   c.log('user********', user)
  // });
});



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
