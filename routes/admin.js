const express = require('express');
const router = express.Router();
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

//import promise
const dbPromise = require('../db'); 

const ensureLoggedIn = ensureLogIn();

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

    try {
        const db = await dbPromise;
        const officialBracket = req.body;

        if (!officialBracket || typeof officialBracket !== 'object' || !officialBracket.Champion || !officialBracket["Round 1"]) {
            return res.status(400).json({ message: 'Invalid bracket data provided.' });
        }

        await db.run(
            'INSERT OR REPLACE INTO official_bracket (id, bracket_data) VALUES (?, ?)',
            [1, JSON.stringify(officialBracket)]
        );

        const userBrackets = await db.all('SELECT username, bracket FROM brackets');
        for (const userEntry of userBrackets) {
            const userBracketData = JSON.parse(userEntry.bracket);
            const newScore = await calculateScore(userBracketData, officialBracket);
            
            //debugging stuff
            console.log("BROROOROROROOO!!!!!!!!!! AM I RUNNING THE NEW CODE????? SCORE: ", newScore, " USERNAME: ", userEntry.username, " !!!!!!!!!!");
            

            await db.run(
                'UPDATE brackets SET "score" = ? WHERE username = ?',
                [newScore, userEntry.username]
            );
        }

        res.status(200).json({ message: 'All brackets and scores updated successfully' });
        //not sure if 200 is the most appropriate one

    } catch (err) {
        console.error("Server error during /update-bracket:", err);
        next(err);
    }
});

module.exports = router;