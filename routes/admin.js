var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var db = require('../db');

var ensureLoggedIn = ensureLogIn();

/* TO-DO List:

POST update_bracket:
update for the new match result. Request w/ JSON the players brackets will be
scored each time it's updated, and that score will be stored in the DB JSON 
will be Bracket JSON

*/

//Separate function for update bracket router; score calculation stuff
async function calculateScore(userBracket, officialBracket) {
    let totalScore = 0;

    const compareRound = (userRoundStr, officialRoundStr) => {
        let roundScore = 0; //temporary variable/score
        if (userRoundStr && officialRoundStr) {
            try {
                const userAnimals = JSON.parse(userRoundStr);
                const officialAnimals = JSON.parse(officialRoundStr);

                for (let i = 0; i < userAnimals.length; i++) {
                    if (userAnimals[i] == officialAnimals[i]) {
                        roundScore += 10; // putting a random point/score number for now
                    }
                }
                //not sure if it's supposed to be catch hasherror or e
            } catch (e) {
                console.error("JSON Error:", e);
            }
        }
        return roundScore;
    };
    //more score calculate/update stuff
    for (let i = 1; i <= 5; i++) {
        const roundKey = `Round ${i}`;
        totalScore += compareRound(userBracket[roundKey], officialBracket[roundKey]);
    }
    //champion score
    if (userBracket.Champion == officialBracket.Champion) {
        totalScore += 50; //random number for now
    }
    //wild dard score
    if (userBracket['Wild Card'] == officialBracket['Wild Card']) {
        totalScore += 20; //random number for now
    }

    return totalScore;
}


//incomplete
router.post('/update-bracket', ensureLoggedIn, async (req, res, next) => {
  const officialBracket = req.body; 
  db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

module.exports = router;