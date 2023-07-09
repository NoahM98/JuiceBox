const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");
    next();
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // read the tagname from the params
    const tagName = req.params.tagName;
    console.log("tagName: " + tagName);
    try {
        // use our method to get posts by tag name from the db
        const posts = await getPostsByTagName(tagName);
        // send out an object to the client { posts: // the posts }
        if (posts) {
            res.send({
                posts
            })
        } else {
            next({
                name: "UnableToGetPostsByTagName",
                message: "Must include valid tagname"
            })
        }
    } catch ({ name, message }) {
        // forward the name and message to the error handler
        next({ name, message });
    }
});

module.exports = tagsRouter;
