const mongoClient = require('mongodb').MongoClient;
const mongoURL    = 'mongodb://localhost:27017/galleryMeta';
let photoMeta    = null;

    mongoClient.connect(mongoURL, function(err, db){
      console.log('connected to mongoDB')
      // db.collection('photoMetas').insertOne({'name': 'waterfalls'})

      photoMeta = db.collection('photoMeta')
    });

    module.exports = {
      photoMeta: () => photoMeta
    }