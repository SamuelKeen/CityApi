// Creation: Sam Keen 26/01/2019
//Loads express.js and body-parser and starts listening on the relevant port.

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

//Use body parser to parse parameters from requests easily
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
var usersInRadius = require("./api.js")(app);
 
var server = app.listen(3000, function () {
  console.log("Listening on port %s", server.address().port);
});