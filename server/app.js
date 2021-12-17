require('dotenv').config()

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Init database
const initDB = async () => {
    mongoose.Promise = Promise;
    await mongoose.connect('mongodb://localhost:27017/projectdb', {
        connectTimeoutMS: 1000
    });
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error"));

    // If there is no admin user => Add one
    const user = await User.findOne({admin: true});
    if (!user) {
        await new User({
            name: 'admin',
            password: await bcrypt.hash('admin', 10),
            admin: true
        }).save();
    }
}
initDB();

const app = express();

// Setup middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// API routes
app.use('/api/user', require('./routes/user'));
app.use('/api/image', require('./routes/image'));
app.use('/api/post', require('./routes/post'));

// Enable cors if in development mode
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve("..", "client", "build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve("..", "client", "build", "index.html"))
    });
}
else if (process.env.NODE_ENV === "development") {
    const corsOptions = {
        origin: "http://localhost:3000",
        oprionSuccessStatus: 200
    };
    app.use(cors(corsOptions));
}

module.exports = app;
