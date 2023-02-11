var express = require('express');
var logger = require('morgan');

var priceRouter = require('./routes/price');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/price', priceRouter);

module.exports = app;
