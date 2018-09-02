const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const advfilter = require('./AdvFilterContent.json');

const storeRoutes = require('./api/routes/stores');

mongoose.connect('mongodb+srv://Charan_55:8790211044Ch@cluster0-ppgia.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST, GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/stores', storeRoutes);
app.get('/advfilter', function (req, res) {
    res.json(advfilter);
});

app.use((req, res, next) => {
    const error = new Error('not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;