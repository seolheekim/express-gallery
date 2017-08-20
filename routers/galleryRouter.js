const express         = require('express');
const photoMeta       = require('../collections/photoMeta.js').photoMeta
const db              = require('../models');
const router          = express.Router();
const Gallery         = db.Gallery;


router.route('/')
  .get( (req, res) => {
    photoMeta().find().toArray()
      .then(metas => {
        console.log("THIS IS THE METAS FROM / GET ROUTE: ", metas)
    })
    .catch(err => {
      console.log(err)
    })
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
      .then( (data) => {
        Gallery.findAll({
          limit: 1,
          order: [[ 'createdAt', 'DESC' ]]
        })
          .then( (item) => {
            console.log('*** ITEM >> ', item[0].id);
            let metaObj = {
              id: item[0].id,
              meta: req.body.meta
            }
            photoMeta().insertOne(metaObj)
          })
          .catch( (err) => {
            console.log(err)
          })
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