/*eslint no-console: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var express = require("express");
var passport = require("passport");
var stringifyObj = require("stringify-object");
var bodyParser = require("body-parser");

var app = express();

var server = require("http").createServer();
var port = process.env.PORT || 3000;

var myLogger = function (req, res, next) {
  console.log('LOGGED');
  console.log("==== method: " + req.method + " + " + req.url);
  console.log("==== headers:" + JSON.stringify(req.headers) + "====");
  console.log("==== body:" + JSON.stringify(req.body) + "====");
  next();
}

app.get("/", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/util/links\">Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/cron", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/util/links\">Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/util", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/util/links\">Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/cron/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">Back to Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/util/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/util/bump\">Trigger a Jenkins Build Job.</a><br />";
	responseStr += "<a href=\"/util/links\">Back to Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});


app.get("/util/bump", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>GET WHAT!</h2><br />";
	responseStr += "You need to POST to this URL!<br />";
	responseStr += "<a href=\"/util/links\">Back to Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

// subscribe/onboard a subscriber tenant
app.post("/util/bump", function(req, res) {
      let retVal = "You POSTED!";
      console.log("==== headers:" + JSON.stringify(req.headers) + "====");
      console.log("==== body:" + JSON.stringify(req.body) + "====");
      res.status(200).send(retVal);
});

app.use(myLogger);

server.on("request", app);

server.listen(port, function () {
	console.info("Backend: " + server.address().port);
});
