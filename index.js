const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = env.process.port || 5000;

const Schema = mongoose.Schema;

// const exchangeRateScheme = new Schema({ currency: String, rate: Object }, { versionKey: false });
// const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateScheme);

const photosScheme = new Schema({ id: Number, src: String, name: String, author: String, categories: [String], tags: [String] }, { versionKey: false });
const Photos = mongoose.model('Photos', photosScheme);

app.use(cors());
app.use('/api/images', express.json());
app.use('/api/image', express.json());
app.use('/api/photos-count', express.json());

app.get('/api/exchange-rate', function (req, res) {
    res.send({
        USD: { EUR: 0.95, UAH: 36.75, fullName: 'US Dollar' },
        EUR: { USD: 1.0526, UAH: 38.72, fullName: 'Euro' },
        UAH: { USD: 0.0272, EUR: 0.0258, fullName: 'Ukraine Hryvnia' }
    });
});

app.post('/api/image', function (req, res) {
    const { page, search, filter } = req.body;
    const searchRegExp = new RegExp(search, 'i');

    let query = {};
    if (filter && search) {
        query = {
            $and: [
                { 'categories': filter },
                { $or: [{ 'name': searchRegExp }, { 'tags': searchRegExp }] }
            ]
        }
    } else if (search) {
        query = {
            $or: [
                { 'categories': searchRegExp },
                { 'name': searchRegExp },
                { 'tags': searchRegExp }
            ]
        }
    } else if (filter) {
        query = { 'categories': filter };
    }
    
    Photos.find(query, null, { skip: (page - 1) * 12, limit: 12 }, function (err, photos) {
        if (err) return console.log(err);
        res.send(photos);
    });
});

app.post('/api/photos-count', function (req, res) {
    const { search, filter } = req.body;
    const searchRegExp = new RegExp(search, 'i');

    let query = {};
    if (filter && search) {
        query = {
            $and: [
                { 'categories': filter },
                { $or: [{ 'name': searchRegExp }, { 'tags': searchRegExp }] }
            ]
        }
    } else if (search) {
        query = {
            $or: [
                { 'categories': searchRegExp },
                { 'name': searchRegExp },
                { 'tags': searchRegExp }
            ]
        }
    } else if (filter) {
        query = { 'categories': filter };
    }
    
    Photos.countDocuments(query, function (err, count) {
        if (err) return console.log(err);
        console.log(count);
        res.send({count: count});
    });
});

app.get('/api/photos-counts', function (req, res) {
    Photos.countDocuments({}, async function (err, count) {
        if (err) return console.log(err);
        console.log(count);
        res.json({ count });
    });
});

mongoose.connect('mongodb://localhost:27017/nix', function (err) {
    if (err) return console.log(err);
    app.listen(PORT, function () {
        console.log('Server has been started on PORT ' + PORT);
    });
});