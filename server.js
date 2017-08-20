const express             = require('express');
const exphbs              = require('express-handlebars');
const session             = require('express-session');
const passport            = require('passport');
const LocalStrategy       = require('passport-local').Strategy;
const db                  = require('./models');
const galleryConnection   = require('./routers/galleryRouter.js')
const loginConnection     = require('./routers/login.js');
const methodOverride      = require('method-override');
const bp                  = require('body-parser')
const CONFIG              = require('./config/config.json');
const RedisStore          = require('connect-redis')(session);
const bcrypt              = require('bcrypt');
const app                 = express();
const PORT                = process.env.PORT || 3000;



const saltRounds = 10;

app.use(bp.json())
app.use(bp.urlencoded())

app.use(session({
  store: new RedisStore(),
  secret: CONFIG.SESSION_SECRET,
  name: 'seolhee',
  cookie: {
    maxAge: 1000000
  }
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(
 (username, password, done) => {
    console.log('client-side-username', username)
    console.log('client-side-password', password)

    User.findOne({
      where: {
        username: username
      }
    })
    .then((user) => {
      if(user !== null){
      bcrypt.compare(password, user.password)
        .then( result => {
          console.log("this is the RESULT: ", result)
          if(result){
            console.log("USER & PASSWORD IS CORRECT")
            return done(null, user)
          }else {
            console.log('PASSWORD DOES NOT MATCH')
            return done(null, false, { message: 'Incorrect Password' })
          }
        })
        .catch( err => {
          console.log(err)
        })
      }else{
        throw 'user not found'
      }
    })
    .catch((err) => {
      console.log(err)
      return done(null, false, { message: 'Incorrect Username' })
    })
  }
))

passport.serializeUser(function(user, done) {
  console.log('serializing the user into session')
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  console.log('adding user information into the req object')
  User.findOne({
    where: {
      id: userId
    }
  })
  .then( (user) => {
    return done( null, {
      id: user.id,
      username: user.username
    })
  })
  .catch( (err) => {
    done(err, user)
  })

  done(null, userId);

});

app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

const hbs = exphbs.create({
  extname: 'hbs',
  defaultLayout: 'main'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// router to gallerConnection.js
app.use(galleryConnection);
app.use(loginConnection);

app.use(session({
  secret: 'Keyboard Cat'
}))


app.use(express.static('public'))

app.get('/newUser', (req, res) => {
  res.render('../views/partials/newUser')
  console.log('I NEED MY HASH YOOOOOOOO!')
});

app.post('/newUser', (req, res) => {
  console.log("this is username: ", req.body.username)
  console.log("this is the password: ", req.body.password)

  bcrypt.genSalt(saltRounds)
    .then( salt => {
      bcrypt.hash( req.body.password, salt)
      .then( hash => {
        console.log("this is the HASH: ", hash)
        User.create({
          username: req.body.username,
          password: hash
        })
        .then( () => {
          console.log("Inserted new user!")
          res.end();
        })
        .catch( err => {
          console.log(err)
        })
      })
    })
    .catch( err =>{
      console.log(err)
    })
  res.redirect('/')
})

app.post('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/gallery',
  failureRedirect: '/login'
}));


function userAuthenticated (req, res, next){
  if (req.isAuthenticated()){
    next();
  }else{
    res.redirect('/login')
  }
}

const server = app.listen(PORT, () => {
  db.sequelize.sync()
  console.log(`server running ${PORT}`);
});