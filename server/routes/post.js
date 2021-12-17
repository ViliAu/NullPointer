const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const Comment = require('../models/Comment');

const passport = require('passport');
require('../auth/passport.js')(passport)
const { body, validationResult } = require('express-validator');

// Returns post previews based on url query string filters
router.get('/preview', async (req, res) => {
    const { author, title } = req.query;
    // Get posts with given query filters
    try {
        let postArray = [];
        // Filter posts by author
        if (author) {
            postArray = await Post.find({ author: author }, '_id title text author ratings lastEdited').sort({ lastEdited: 'desc' }).exec();
        }
        // Filter posts by title and body (exclusive)
        else if (title) {
            postArray = await Post.find({$or: [{title: new RegExp(title, 'i') }, {text: new RegExp(title, 'i') }]}, '_id title text author ratings lastEdited').sort({ lastEdited: 'desc' }).exec();
        }
        // Return all posts
        else {
            postArray = await Post.find({}, '_id title text author ratings lastEdited').sort({ lastEdited: 'desc' }).exec();
        }
        res.status(200).json({ success: true, previews: postArray });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: "Something went wrong" });
    }

});

// Returns a post with all comments to the client and calculate the posts rating
router.get('/postdata', async (req, res) => {
    const { id } = req.query;
    try {
        // Fetch post and fetch all comments
        const post = await Post.findById(id).exec();
        let fetchedComments = [];

        // Get all comments
        for (comment of post.comments) {
            const commentObj = await Comment.findById(comment._id).exec();
            // Check if comment exists
            if (!commentObj) {
                continue;
            }
            fetchedComments.push(commentObj)
        }
        // Calculate rating
        let rating = 0;
        for (like of post.ratings) {
            rating += like.rating;
        }
        res.status(200).send({ success: true, post: post, comments: fetchedComments, rating: rating });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: "Something went wrong" });
    }
});

// Route for uploading a post. Requires auth.
router.post('/',
    body('title').trim().isLength({ min: 1, max: 50 }).escape(),
    body('text').isLength({ min: 1 }).escape(),
    passport.authenticate('jwt', { session: false }), async (req, res) => {
        // Validate post form
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "Post title and body cannot be empty." });
        }
        // Upload post to database
        try {
            const newPost = await new Post({
                title: req.body.title,
                text: req.body.text,
                code: req.body.code,
                author: req.user.id,
            }).save();
            res.status(200).json({ success: true, id: newPost._id });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ success: false, error: "Something went wrong!" });
        }
    });

// Deletes a post from database
router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id } = req.query;
    try {
        // Check if the id is a post id
        let post = await Post.findById(id).exec();
        if (post) {
            // Check authorization
            if (!req.user.admin && !post.author.equals(req.user._id)) {
                return res.status(401).send({ success: false, error: "Unauthorized" });
            }
            // Check if the post has any comments and delete them
            for (comment of post.comments) {
                await Comment.findByIdAndDelete(comment._id).exec();
            }
            await Post.findByIdAndDelete(id).exec();
            return res.status(200).json({success: true});
        }

        // Check if the id is a comment id instead
        else {
            post = await Comment.findById(id).exec();
            if (post) {
                // Check authorization
                if (!req.user.admin && !post.author.equals(req.user._id)) {
                    return res.status(401).send({ success: false, error: "Unauthorized" });
                }
                await Comment.findByIdAndDelete(id).exec();
                return res.status(200).json({success: true});
            }
            else {
                return res.status(404).json({success: false, error: "Couldn't find post"});
            }
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, error: "Something went wrong!" });
    }

});

// Adds a comment to the database and links it to the post
router.post('/comment',
    body('title').trim().isLength({ min: 1, max: 50 }).escape(),
    body('text').isLength({ min: 1 }).escape(),
    passport.authenticate('jwt', { session: false }), async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "Post title and body cannot be empty." });
        }
        try {
            // First try to see if the post still exists
            const post = await Post.findById(req.body.id).exec();
            if (post) {
                const newComment = await new Comment({
                    title: req.body.title,
                    text: req.body.text,
                    author: req.user.id,
                }).save();
                await post.comments.push(newComment._id);
                await post.save();
                res.status(200).json({ success: true, id: newComment._id });
            }
            else {
                res.status(400).json({ success: false, error: "Post not found or doesn't exist anymore!" });
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ success: false, error: "Something went wrong!" });
        }
    });

// Adds a rating to a post or a comment
router.put('/rate', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id } = req.query;
    if (req.body.rating === null || req.body.rating < -1 || req.body.rating > 1) {
        return res.status(400).json({ success: false, error: "Bad request" });
    }
    try {
        // Check if the rated thing is a post
        let post = await Post.findById(id).exec();
        if (post) {
            // Clear previous ratings and update with the new one
            await Post.findByIdAndUpdate(id, { $pull: { ratings: { author: req.user._id } } }).exec();
            await Post.findByIdAndUpdate(id, { $push: { ratings: { author: req.user._id, rating: req.body.rating } } }).exec();
            res.status(200).json({ success: true });
        }
        // Check if the rated thing is a comment
        else {
            post = await Comment.findById(id).exec();
            if (post) {
                // Clear previous ratings and update with the new one
                await Comment.findByIdAndUpdate(id, { $pull: { ratings: { author: req.user._id } } }).exec();
                await Comment.findByIdAndUpdate(id, { $push: { ratings: { author: req.user._id, rating: req.body.rating } } }).exec();
                res.status(200).json({ success: true });
            }
            else {
                res.status(400).json({ success: false, error: "Post not found or doesn't exist anymore!" });
            }
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, error: "Something went wrong!" });
    }
});

// Route for editing a post
router.patch('/edit',
    body('title').trim().isLength({ min: 1, max: 50 }).escape(),
    body('text').isLength({ min: 1 }).escape(),
    passport.authenticate('jwt', { session: false }), async (req, res) => {
        const { id } = req.query;

        // Validate form
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "Post title and body cannot be empty." });
        }

        try {
            const date = new Date().toISOString();
            // Check if the edited thing is a post
            let post = await Post.findById(id);
            if (post) {
                // Check authorization
                if (!req.user.admin && !post.author.equals(req.user._id)) {
                    return res.status(401).send({ success: false, error: "Unauthorized" });
                }
                else {
                    await Post.findByIdAndUpdate(id, {
                        title: req.body.title,
                        text: req.body.text,
                        code: req.body.code,
                        lastEdited: date
                    }).exec();
                    res.json({ success: true });
                }
            }

            // Check if the edited thing is a comment instead
            else {
                post = await Comment.findById(id);
                if (post) {
                    // Check authorization
                    if (!req.user.admin && !post.author.equals(req.user._id)) {
                        return res.status(401).send({ success: false, error: "Unauthorized" });
                    }
                    else {
                        await Comment.findByIdAndUpdate(id, {
                            title: req.body.title,
                            text: req.body.text,
                            lastEdited: date
                        }).exec();
                        res.json({ success: true });
                    }
                }
                else {
                    return res.status(404).send({ success: false, error: "Post not found" });
                }
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ success: false, error: "Something went wrong!" });
        }
    });

// Get the amount of posts in the database
router.get('/amount', async (req, res) => {
    try {
        const p = await Post.find({});
        res.status(200).json({amount: p.length});
    }
    catch {
        res.status(500).json({ success: false, error: "Something went wrong!" });
    }
});

module.exports = router;