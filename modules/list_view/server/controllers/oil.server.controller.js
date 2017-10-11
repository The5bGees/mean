'use strict';
//TODO might need to be fix
/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Oil = mongoose.model('Oil'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Oil
 */
exports.create = function (req, res) {
    var oil = new Oil(req.body);
    oil.user = req.user;

    oil.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(oil);
        }
    });
};

/**
 * Show the current Oil
 */
exports.read = function (req, res) {
    res.json(req.oil);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
    var oil = req.oil;

    oil.title = req.body.title;
    oil.content = req.body.content;
    oil.companyId = req.body.companyId;

    oil.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(oil);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
    var article = req.oil;

    article.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
    Oil.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(articles);
        }
    });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Article is invalid'
        });
    }

    Oil.findById(id).populate('user', 'displayName').exec(function (err, article) {
        if (err) {
            return next(err);
        } else if (!article) {
            return res.status(404).send({
                message: 'No article with that identifier has been found'
            });
        }
        req.article = article;
        next();
    });
};