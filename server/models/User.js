const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    image: {type: mongoose.Types.ObjectId, default: null},
    bio: {type: String, default: ''},
    registerDate: {type: Date, default: Date.now},
    admin: {type: Boolean, default: false}
});

module.exports = mongoose.model("User", userSchema);
