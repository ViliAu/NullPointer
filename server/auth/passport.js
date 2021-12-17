const User = require("../models/User");
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
    secretOrKey: process.env.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = function (passport) {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                const user = await User.findOne({_id: payload.id}, '-password');
                if (user) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }

            }
            catch (e) {
                console.log(e);
                return done(e, false);
            }
        })
    );
}