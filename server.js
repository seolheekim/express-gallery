const express             = require('express');
const exphbs              = require('express-handlebars');
const session             = require('express-session');
const passport            = require('passport');
const LocalStrategy       = require('passport-local').Strategy;
const db                  = require('./models');
const User                = require('./models').User;
const galleryConnection   = require('./routers/galleryRouter.js')
const loginConnection     = require('./routers/login.js');
const methodOverride      = require('method-override');
const bp                  = require('body-parser')
const CONFIG              = require('./config/config.json');
const RedisStore          = require('connect-redis')(session);
const app                 = express();
const PORT                = process.env.PORT || 3000;

app.use(bp.json())
app.use(bp.urlencoded())

app.use(session({
  store: new RedisStore(),
  secret: CONFIG.SESSION_SECRET,
  name: 'seolhee',
  cookie: {
    maxAge: 1000000
  },
  saveUninitialized: true
}))

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

app.use(passport.initialize())
app.use(passport.session())


passport.use(new LocalStrategy(
  function (username, password, done) {
            // ^ client side username and password
    console.log('client-side-username', username)
    console.log('client-side-password', password)

    User.findOne({
      where: {
        username: username
      }
    })
    .then((user) => {
      console.log('User exists in DB')
      if (user.password === password){
        return done(null, user)
      }else{
        return done(null, false, { message: 'Incorrect Password' })
      }
    })
    .catch((err) => {
      console.log(err)
      return done(null, false, { message: 'Incorrect Username' })
    })

  }
))

passport.serializeUser(function(user, done) {
                              // ^ received from the LocalStratgy succession
  console.log('serializing the user into session')

  done(null, user.id);
  // ^ building the object/values/information to store into the session object
});

passport.deserializeUser(function(userId, done) {
  console.log('adding user information into the req object')
  User.findOne({
    where: {
      id: userId
    }
  }).then( (user) => {
    return done( null, {
      id: user.id,
      username: user.username
    })
  }).catch( (err) => {
    done(err, user)
  })

  done(null, userId);
          // ^ add the serialized information into the request object
});

app.use(express.static('public'))

app.get('/newUser', (req, res) => {
  res.render('../views/partials/newUser')
});

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