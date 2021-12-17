const express = require('express');
const Image = require('../models/Image');
const multer = require('multer');
const upload = multer();
const router = express.Router();

// Returns a image blob to the client based on the imageId param
router.get('/:imageId', async (req, res) => {
    try {
        const img = await Image.findById(req.params.imageId);
        if (img) {
            res.header("Content-Type", img.mimetype);
            res.header("Content-Disposition", `inline; filename="${img.name}"`);
            res.send(img.buffer);
        }
        else {
            res.status(404).send({success: false, error: "Couldn't find image " + req.params.imageId});
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({success: false, error: "Something went wrong"});
    }
})

// Saves image to the database using multer. Takes the image from formdata
router.post('/', upload.single('image'), async (req, res) => {
    if (req.file === null) {
        res.status(400).end;
        return;
    }
    let img = req.file;
    try {
        const dbImg = await new Image({
            name: img.originalname,
            encoding: img.encoding,
            mimetype: img.mimetype,
            buffer: img.buffer
        }).save();
        res.json({id: dbImg.id});
    }
    catch (e) {
        console.log(e);
        res.status(500).json({success: false, error: "Something went wrong"});
    }
});

module.exports = router;