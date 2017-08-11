const express             = require('express');
const exphbs              = require('express-handlebars');
const bp                  = require('body-parser')
const methodOverride      = require('method-override');
const app                 = express();
const galleryConnection   = require('./routers/galleryRouter.js')
const db                  = require('./models');
const PORT                = process.env.PORT || 3000;


app.use(bp.json())
app.use(express.static('public'))
app.use(bp.urlencoded())
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

// router
app.use(galleryConnection);

const server = app.listen(PORT, () => {
  db.sequelize.sync()
  console.log(`server running ${PORT}`);
});