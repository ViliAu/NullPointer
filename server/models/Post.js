const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let postSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String, required: true},
    code: {type: String},
    author: {type: mongoose.Types.ObjectId, required: true},
    comments: {type: [{id: mongoose.Types.ObjectId}], default: []},
    ratings: {type: [{rating: Number, author: mongoose.Types.ObjectId}], default: []},
    lastEdited: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Post", postSchema);
