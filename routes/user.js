//REMINDER: no microsoft stuff bc it sucks :((((((((

var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var db = require('../db');

var ensureLoggedIn = ensureLogIn();

// POST signup
router.post('/signup', async (req, res, next) => { 
    const { username, password } = req.body; // Expecting username and password from form

    // Basic validation: Check if username or password are empty
    if (!username || !password) {
        return res.render('signup', { message: 'Required section: username and password' });
        //change res.render to smth else? idk
    }

    // checks if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return next(err);
        }
        if (user) {
            //if username exists, send error message
            return res.render('signup', { message: 'Username innapplicabele: already exists.' });
        }

        try {
            // hashes the password securely
            const salt = await bcrypt.genSalt(10); // Generate a salt (recommended strength 10-12)
            const hashedPassword = await bcrypt.hash(password, salt); // Hash password with the salt

            // Store new user in the database
            db.run('INSERT INTO users (username, hashedPassword) VALUES (?, ?)', [username, hashedPassword], function(err) {
                if (err) {
                    //pass database insertion error to Express error handling
                    return next(err);
                }
                console.log(`User ${username} registered with ID: ${this.lastID}`);
                ///Redirects to login page after successful signup
                return res.redirect('/login?message=Registration successful! Please log in.');
            });
        } catch (hashError) {
            // Catch errors during password hashing
            console.error('Error hashing password:', hashError);
            return next(hashError); // Pass error to Express error handling
        }
    });
});


//signin router
router.post('/signin', async (req, res, next) => {
  db.run('DELETE FROM todos WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

module.exports = router; //might need to add a bit more idk the format