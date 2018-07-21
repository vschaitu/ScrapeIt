// Once the DOM is fully loaded.
$(function () {

    // on submit , post the request

    $(".headp").on("click", "#scrape", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // route to scrape express route
        window.location.href = "/scrape";

    });

});
