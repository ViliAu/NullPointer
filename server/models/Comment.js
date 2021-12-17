const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let commentSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId, required: true},
    ratings: {type: [{rating: Number, author: mongoose.Types.ObjectId}], default: []},
    lastEdited: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Comment", commentSchema);
