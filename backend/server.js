const realtor = require('realtorca')
const bodyParser = require('body-parser')
const express = require('express'),
    app = express(),

    path = require('path'),
    log = console.log,
    PORT = process.env.PORT || 8080;

app.use(express.static(path.resolve(__dirname + './../build')));

app.use(bodyParser.json({ extended: false }))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})

//Paramaters of information to be recieved are set here.
let opts = {
    LongitudeMin: -79.456215,
    LongitudeMax: -79.354591,
    LatitudeMin: 43.634646,
    LatitudeMax: 43.704863,
    PriceMin: 100000,
    PriceMax: 500000,
    TransactionTypeId: 2,
    RecordsPerPage: 200,
    mode: 'no-cors'
};





//Get Request to Realtor API gets Data of Listins needed to populate Map.
//Express Server needed to be used as making the get request directly from
// a browser does not allow access.
app.get('/map', (req, res) => {
    realtor.post(opts)
        .then(data => {
            res.send(data)
            console.log(data);
        })
        .catch(err => {
            console.log(err)
        });
})

///Post request to update lisitng in real time depending on price range selevted by user//

app.post('/map', (req, res) => {
    let change = {
        LongitudeMin: -79.456215,
        LongitudeMax: -79.354591,
        LatitudeMin: 43.634646,
        LatitudeMax: 43.704863,
        PriceMax: req.body.maxPrice,
        PriceMin: req.body.minPrice,
        TransactionTypeId: req.body.listingType,
        RecordsPerPage: 200,
        mode: 'no-cors'
    }

    realtor.post(change)
        .then(data => {
            res.send(data)
            console.log(data.Results);
        })
        .catch(err => {
            console.log(err)
        });
})

if (process.env.NODE_ENV === 'production') {
    app.unsubscribe(express.static('../build'))
}
app.get('*', (req, res) => {
    res.sendFile(path.resolve((__dirname + '../build/index.html')));
})

app.listen(PORT, () => log(`We are live on port ${PORT}`))
