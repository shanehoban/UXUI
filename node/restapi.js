
var express = require('express');
var bodyParser = require('body-parser')
var fs = require("fs");
var app = express();

var coupons = {
	COYBIG20: 20
};

var ORDERS = [];

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

app.get('/menus', function (req, res) {
   fs.readFile( "../data/resteraunts.json", 'utf8', function (err, data) {
	   	res.end( data );
   });
});

app.get('/menus/:name', function (req, res) {
   fs.readFile( "../data/" + req.params.name, 'utf8', function (err, data) {
	   	res.end( data );
   });
});

app.get('/coupon/:code', function (req, res) {
	console.log(req.params.code);
	if(typeof coupons[req.params.code] !== "undefined"){
		res.end(JSON.stringify(coupons[req.params.code]));
	} else {
		res.end(JSON.stringify(false));
	}
});

app.get('/orders', function (req, res) {
	res.end(JSON.stringify(ORDERS));
});

app.post('/order', function (req, res) {
	req.body['orderedAt'] = new Date().getTime();
	ORDERS.push(req.body);
  	res.end(JSON.stringify(req.body));
});

var server = app.listen(1337, function () {
	var host = server.address().address
	var port = server.address().port
});