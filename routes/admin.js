var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var db = require('../db');

var ensureLoggedIn = ensureLogIn();

/* TO-DO List:

POST update_bracket:
update for the new match result. Request w/ JSON the players brackets will be
scored each time it's updated, and that score will be stored in the DB JSON 
will be Bracket JSON

POST new_bracket:
a new march mammal madness season. Request w/ JSON JSON will be a 64 length array
with each animal name, like ["bear","cat","donkey"] but longer

*/

module.exports = router;