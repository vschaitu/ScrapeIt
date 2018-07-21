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
    // Find all users
    db.Article.find({})
        // Specify that we want to populate the retrieved users with any associated notes
        .populate("notes")
        .then(function (data) {
            // If able to successfully find and associate all Users and Notes, send them back to the client
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


// A GET route for scraping the echoJS website 
router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.indiatimes.com/entertainment/")
        .then(function (response) {

            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);


            // Now, we grab every h2 within an article tag, and do the following:
            $(".list-container ul li").each(function (i, element) {

                // console.log($(this).children("figure").children("a").attr("href"));
                // console.log($("figure > a").attr("href"));
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $("figure > a", this).attr("title");
                result.link = $("figure > a", this).attr("href");
                result.imgURL = $("figure > a > img", this).attr("src");
                result.shares = $("figure > figcaption > div > div.card-info > span.share-count > span.number", this).html() + "K Shares";

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
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

// Export routes for server.js to use.
module.exports = router;