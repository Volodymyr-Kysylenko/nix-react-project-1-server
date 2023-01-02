const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const Schema = mongoose.Schema;
const mongodbURI = 'mongodb+srv://osvitoria:Osvitoria2022@cluster0.oc88i.mongodb.net/nix';

const quizzesScheme = new Schema({ name: String, questions: [Object] });
const Quizzes = mongoose.model('Quizzes', quizzesScheme);

const imagesScheme = new Schema({ id: Number, src: String, name: String, author: String, categories: [String], tags: [String] }, { versionKey: false });
const Images = mongoose.model('Images', imagesScheme);

app.use(cors());
app.use('/api/images', express.json());
app.use('/api/images-count', express.json());
app.use('/api/quiz', express.json());

app.get('/api/exchange-rate', function (req, res) {
    res.send({
        USD: { EUR: 0.95, UAH: 36.75, fullName: 'US Dollar' },
        EUR: { USD: 1.0526, UAH: 38.72, fullName: 'Euro' },
        UAH: { USD: 0.0272, EUR: 0.0258, fullName: 'Ukraine Hryvnia' }
    });
});

app.get('/api/quiz-list', function (req, res) {
    Quizzes.find({}, 'name timer questionsamount', function (err, quizzes) {
        if (err) return console.log(err);
        res.send(quizzes);
    });
});

app.post('/api/quiz', function (req, res) {
    const id = req.body.id;

    Quizzes.findOne({_id: id}, function (err, quiz) {
        if (err) return console.log(err);
        res.send(quiz);
    });
});

app.post('/api/images', function (req, res) {
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

    Images.find(query, null, { skip: (page - 1) * 12, limit: 12 }, function (err, photos) {
        if (err) return console.log(err);
        res.send(photos);
    });
});

app.post('/api/images-count', function (req, res) {
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

    Images.countDocuments(query, function (err, count) {
        if (err) return console.log(err);
        res.send({ count: count });
    });
});

mongoose.connect(mongodbURI, function (err) {
    if (err) return console.log(err);
    app.listen(PORT, function () {
        console.log('Server has been started on PORT ' + PORT);
    });
});