const express         = require('express');
const router          = express.Router();
const db              = require('../models');
const Gallery         = db.Gallery;


router.route('/')
  .get( (req, res) => {
    Gallery.findAll()
      .then( (allGallery) => {
        res.render('../views/gallery/index',
        {
          gallery: allGallery,
          user: req.user
        })
      })
      .catch( (err) => {
        console.log(err)
      })
  })
  .post( (req, res) => {
    Gallery.create({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    })
    .then( (addGallery) => {
      res.redirect('/')
    })
    .catch( (err) => {
      console.log(err)
    })
});

router.route('/gallery')
  .get( (req, res) => {
    Gallery.findAll()
      .then( (allGallery) => {
        res.render('../views/gallery/index', {gallery: allGallery})
      })
      .catch( (err) => {
        console.log(err)
      })
  })
  .post( (req, res) => {
      Gallery.create({
        author: req.body.author,
        link: req.body.link,
        description: req.body.description
      })
        .then( (addGallery) => {
          res.redirect('/gallery')
        })
        .catch( (err) => {
          console.log(err)
        })
  });

router.route('/gallery/new')
  .get( (req, res) => {
    Gallery.findAll()
      .then( (allGallery) => {
        res.render('../views/gallery/new', {allGallery})
      })
      .catch( (err) => {
        console.log(err)
      })
});

router.route('/gallery/:id')
  .get( (req, res) => {
    Gallery.findById(parseInt(req.params.id))
      .then( (galleryId) => {
        let galleryData = {
          author: galleryId.author,
          link: galleryId.link,
          description: galleryId.description,
          id: galleryId.id
        }
        res.render('../views/gallery/singleGallery', galleryData)
      })
      .catch( (err) => {
        console.log(err)
      })
  })
  .put( (req, res) => {
    Gallery.update({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
      },{
        // returning: true,
        where: {
         id:req.params.id
        }
    })
      .then( (gallery) =>{
        res.redirect(`/gallery/${parseInt(req.params.id)}/edit`)
      })
      .catch((err)=>{
        console.log(err)
      })
  })
  .delete( (req,res)=>{
    Gallery.destroy({
      where:{
        id:req.params.id
      }
    })
    .then((gallery) =>{
     res.redirect('/gallery')
    })
    .catch((err)=>{
      console.log(err)
    })
  });

router.route('/gallery/:id/edit')
  .get( (req, res) => {
    Gallery.findById(parseInt(req.params.id))
      .then( (galleryId) => {
        let galleryData = {
            author: galleryId.author,
            link: galleryId.link,
            description: galleryId.description,
            id: galleryId.id
        }
        res.render('../views/gallery/edit', galleryData)
      })
      .catch( (err) => {
        console.log(err)
      })
  });

module.exports = router;