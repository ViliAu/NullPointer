const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
require('../auth/passport.js')(passport)

// Route for logging in
// Usernames and passwords can't contain dangerous symbols so they aren't escaped
router.post('/login',
    body('name').trim().matches(/^[a-zA-Z\d]{0,15}$/),
    body('password').matches(/^admin$|^[a-zA-Z\d!@#$%^&\?]{0,20}$/),
    async (req, res) => {
        // Check form validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Name or password contains incorrect characters.' });
        }
        try {
            // Check for a case insensitive match in the database
            const result = await User.findOne({ name: new RegExp('^'+ req.body.name + '$', "i") });
            //Found a match
            if (result) {
                // Compare pswd
                if (await bcrypt.compare(req.body.password, result.password)) {
                    // Valid credentials => Write a token for 1h and send it to the client
                    const token = await jwt.sign(
                        {
                            id: result._id,
                            name: result.name
                        },
                        process.env.SECRET,
                        {
                            expiresIn: '1h'
                        });
                    res.status(200).json({ success: true, token });
                }
                else {
                    res.status(403).json({ success: false, error: "Invalid credentials." });
                }
            }
            else {
                res.status(400).send({ success: false, error: "Invalid credentials." });
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).send({ success: false, error: "Something went wrong." });
        }
    });

// Route for registering a user
router.post('/register',
    body('name').trim().isLength({ min: 3, max: 15 }).matches(/^[a-zA-Z\d]{3,15}$/),
    body('password').isLength({ min: 8, max: 20 }).matches(/^$|^((?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[!@#$%^&?]))[a-zA-Z\d!@#$%^&?]{8,20}$/),
    async (req, res) => {
        // Validate form
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Invalid form' });
        }
        try {
            // Check if a user already exists with the name
            const result = await User.findOne({ name: new RegExp('^'+ req.body.name + '$', "i") });
            if (!result) {
                // Hash the password so that no plain passwords are stored in the db
                const hash = await bcrypt.hash(req.body.password, 10);
                await new User({
                    name: req.body.name,
                    password: hash,
                }).save();
                res.status(200).json({ success: true, message: "User added!" });
            }
            else {
                res.status(403).json({ success: false, error: "User already exists" });
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).send({ success: false, error: "Something went wrong!" });
        }
    });

// Returns a single user if a name or id query param is passed. Otherwise returns all users
router.get('/getuser', async (req, res) => {
    const { name, id } = req.query;
    try {
        let result;
        // Find by name (case insensitive)
        if (name) {
            result = await User.findOne({ name: new RegExp('^'+ name + '$', "i") }, '-password');
        }
        // Find by id
        else if (id) {
            result = await User.findById(id, '-password');
        }
        // Find all users
        else {
            result = await User.find({}, '-password');
        }
        if (result) {
            res.json({ success: true, user: result });
        }
        else {
            res.status(400).send({ success: false, error: "User not found" });
        }
    }
    catch (e) {
        res.status(500).send({ success: false, error: "User not found" });
    }
});

// Route for updating user settings
router.patch('/updateuser',
    body('name').trim().isLength({ min: 3, max: 15 }).matches(/^[a-zA-Z\d]{3,15}$/),
    body('password').matches(/^$|^((?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[!@#$%^&?]))[a-zA-Z\d!@#$%^&?]{8,20}$/),
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const {id} = req.query;
        // Validate user and check if the updates are valid
        // Is the user authorized?
        if (!req.user._id.equals(id)) {
            console.log("Unauthorized");
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }
        // Is the form valid?
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ success: false, error: 'Invalid form' });
        }
        // Is the username taken?
        if (req.body.name !== req.user.name) {
            const user = await User.findOne({ name: req.body.name });
            if (user) {
                console.log("User already exists");
                return res.status(400).json({ success: false, error: 'Username is already taken' });
            }
        }

        // Construct a update object from the given data
        let newUserData = {}
        if (req.body.name !== req.user.name) {
            newUserData.name = req.body.name
        }
        if (req.body.password) {
            newUserData.password = await bcrypt.hash(req.body.password, 10);
        }
        if (req.body.image !== '') {
            newUserData.image = req.body.image;
        }
        newUserData.bio = req.body.bio;

        // Update the user to datavase
        try {
            await User.findOneAndUpdate({name: req.user.name}, newUserData).exec();
            res.status(200).json({ success: true});
        }
        catch (e) {
            console.log(e);
            // failsafe
            if (e.codeName === 'DuplicateKey') {
                res.status(400).json({ success: false, error: 'Username is already taken' });
            }
            res.status(500).json({ success: false, error: 'Something went wrong!' });
        }

    });

// Returns a user object on success, otherwise returns a 401 status
// A name or id can be passed as well to check validity (for example if we want to prevent the rendering of certain sites)
// An admin user, can however, bypass this
router.get('/authenticate', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {name, id} = req.query;
    // Auth by name
    if (name) {
        if ((req.user.admin || req.user.name === name)) {
            return res.status(200).send(req.user);
        }
        else {
            return res.status(401).end();
        }
    }
    // Auth by id
    else if (id) {
        if ((req.user.admin || req.user._id.equals(id))) {
            return res.status(200).send(req.user);
        }
        else {
            return res.status(401).end();
        }
    }
    // Auth
    else {
        return res.status(200).send(req.user);
    }

});

// Get the amount of users in the db
router.get('/amount', async (req, res) => {
    try {
        const u = await User.find({});
        res.status(200).json({amount: u.length});
    }
    catch {
        res.status(500).json({ success: false, error: "Something went wrong!" });
    }
});

module.exports = router;