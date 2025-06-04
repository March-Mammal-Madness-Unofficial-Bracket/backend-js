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


router.post('/update-bracket', ensureLoggedIn, async (req, res, next) => {
  const officialBracket = req.body;

    //basic validation not sure if I need to add more
    if (!officialBracket || typeof officialBracket != 'object' || !officialBracket.Champion || !officialBracket["Round 1"]) {
        return res.status(400).json({ message: 'Invalid bracket data provided. Ensure it matches the Bracket JSON format.' });
    }   //are other 400-numbers (e.g., 401, 402) better?

    try {
        //not used to using promise
        await new Promise((resolve, reject) => {
            db.run('INSERT OR REPLACE INTO official_bracket (id, bracket_data) VALUES (?, ?)',
                [1, JSON.stringify(officialBracket)],
                function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        }); 
        
        // recalculates all user bracket scores
        const userBrackets = await new Promise((resolve, reject) => {
            db.all('SELECT username, bracket FROM brackets', [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });

        for (const userEntry of userBrackets) {
            const username = userEntry.username;
            const userBracketData = JSON.parse(userEntry.bracket); // User's submitted bracket

            const newScore = await calculateScore(userBracketData, officialBracket);

            // Update the user's score in the 'brackets' table
            await new Promise((resolve, reject) => {
                db.run('UPDATE brackets SET score = ? WHERE username = ?', [newScore, username], function(err) {
                    if (err) {
                        console.error(`Score update failure for ${username}:`, err);
                    }
                    resolve();
                });
            });
        }

        res.status(200).json({ message: 'All brackets and scores updated successfully' });
        //or is is 202 accepted instead of 200? unsure about response status codes

    } catch (err) {
        console.error("Server error during /update-bracket:", err);
        next(err);
    }    

    db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?', [
        req.params.id,
        req.user.id
    ], function(err) {

    //remove if unecessary bc previous part of the catch err code
    if (err) { return next(err); }
        return res.redirect('/' + (req.body.filter || ''));
    });
});

module.exports = router;
