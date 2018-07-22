//  Import Express and create router
var express = require("express");
var router = express.Router();

// Import npm packages
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");


// Require all models
var db = require("./../models");


// Get home page 
router.get("/", function (req, res) {
    // Find all Article
    db.Article.find({})
        .sort({_id:-1})
        .then(function (data) {
            // After finding all Articles, render the page and send
            var isDataPresent;
            var hbsobject;
            if (data.length > 0) {
                isDataPresent = true
            } else {
                isDataPresent = false
            };
            hbsobject = {
                'isDataPresent': isDataPresent,
                'article': data
            };
            res.render("index", hbsobject);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// A GET route for scraping the website 
router.get("/scrape", function (req, res) {
    // First,  grab the body of the html with request
    axios.get("https://www.indiatimes.com/entertainment/")
        .then(function (response) {

            // Then, load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);


            // Now, we grab every h2 within an article tag, and do the following:
            $(".list-container ul li").each(function (i, element) {

;
                // Save an empty result object
                var result = {};

                // Add the title, image link and href of every link, and save them as properties of the result object
                result.title = $("figure > a", this).attr("title");
                result.link = $("figure > a", this).attr("href");
                result.imgURL = $("figure > a > img", this).attr("src");
                result.shares = $("figure > figcaption > div > div.card-info > span.share-count > span.number", this).html() + "K Shares";

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });

            // If we were able to successfully load redirect to home page
            res.redirect('/');
        });
});


// Get Aritcle with notes API
router.get("/api/article/:id", function (req, res) {
    // Find article by Id
    db.Article.findById({ "_id": req.params.id })
        // Specify that we want to populate the retrieved article with any associated notes
        .populate("notes")
        .then(function (data) {
            // If able to successfully find and associate all send them back to the client
            res.json(data);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// Add Notes to an Aritcle 
router.post("/api/article/:id", function (req, res) {
    // crate new note
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Delete article document
router.delete("/api/note/:id", function (req, res) {
    // Find all users
    db.Note.findByIdAndRemove({"_id": req.params.id })
        .then(function (dbNote) {
            // If a Note deleted successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be remove the reference of deleted notes_id
            return db.Article.findOneAndUpdate({ notes: req.params.id }, { $pull: { notes: req.params.id } }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Delete document
router.delete("/api/article/:id", function (req, res) {
    // Find article and delete
    db.Article.findByIdAndRemove({"_id": req.params.id})
        .then(function (data) {
            // If able to successfully delete send them back to the client
            res.json(data);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// Export routes for server.js to use.
module.exports = router;