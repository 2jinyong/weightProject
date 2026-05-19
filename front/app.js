var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app).listen(3000);
var path = require('path');
app.use(express.static('public'));
// const axios = require('axios');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/home.html'));
});

app.get('/bmi', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/bmi.html'));
});
app.get('/fitness', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/fitness.html'));
});

app.get('/food', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/food.html'));
});
