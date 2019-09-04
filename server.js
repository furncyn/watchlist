const bodyParser = require('body-parser');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
let {PythonShell} = require('python-shell')

const app = express();
const port = 3000;

const url = "mongodb+srv://furncyn:courtside5@watchlist-4bthd.gcp.mongodb.net/test?retryWrites=true&w=majority";

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const scraperPath = 'scraper.py';

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
            res.render('index.ejs', {watchlist: result})
          })
    })

    
    // Take in url, resolve for price, then add {url, price} to the database.
    app.post('/add-item', (req, res) => {
        let pyshell = new PythonShell(scraperPath, {mode: 'text', args: [req.body.url]})
        pyshell.on('message', function(message) {
           
            var dbSchema = require('./models/dbSchema');
            const newData = new dbSchema({
                url: req.body.url,
                price: parseFloat(message),
            })
            console.log(newData)
            
            db.collection('watchlist').update(newData, newData, {upsert: true}, (err, result) => {
                if (err) return console.log(err)
                console.log('saved to database')
                res.redirect('/')
            })
        }) 
        pyshell.end(function(err) {
            if (err) return console.log(err);
            console.log('success')
        })                  
    })

    // Retrieve all items in the watchlist database and disolay in a list
    app.get('/mywatchlist', (req, res) => {
        db.collection('watchlist').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('mywatchlist.ejs', {watchlist: result})
        })
    })
});
