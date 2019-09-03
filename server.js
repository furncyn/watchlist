const bodyParser = require('body-parser');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3000;

const url = "mongodb+srv://furncyn:courtside5@watchlist-4bthd.gcp.mongodb.net/test?retryWrites=true&w=majority";

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// Connect to database and create collection
MongoClient.connect(url, { useNewUrlParser: true }, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    var db = client.db('watchlist');
    
    app.listen(port, function() {
        console.log(`listening on port ${port}`);
    })

    app.get('/', (req, res) => {
        db.collection('watchlist').find().toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.render('index.ejs', {watchlist: result})
          })
    })

    // Add input url into watchlist database
    app.post('/add-item', (req, res) => {
        db.collection('watchlist').insertOne(req.body, (err, result) => {
            if (err) return console.log(err)
            console.log('saved to database')
            res.redirect('/')
        })
    })

    // Retrieve all items in the watchlist database
    app.get('/mywatchlist', (req, res) => {
        db.collection('watchlist').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('mywatchlist.ejs', {watchlist: result})
        })
    })
});
