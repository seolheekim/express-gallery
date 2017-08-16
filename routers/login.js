const express     = require('express');
const router      = express.Router();
const app         = express();
const User        = require('../models').User;

router.route('/new')
  .post( (req,res)=>{
    User.create({
      username: req.body.username,
      password: req.body.password
    })
    .then((data)=>{
      res.redirect('/gallery')
    })
    .catch((err)=>{
      console.log(err)
    })
  })

router.route('/login')
  .get( (req, res) => {
    User.findAll()
    .then( (data) => {
      res.render('../views/gallery/index')
    })
    .catch( (err) => {
      console.log(err)
    })
  })
  .post( (req, res) => {
    User.find()
    .then( (data) => {
      res.redirect('/gallery')
    })
    .catch( (err) => {
      console.log(err)
     })
  })
module.exports = router;