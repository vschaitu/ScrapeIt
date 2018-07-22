// Once the DOM is fully loaded.
$(function () {

    // on submit , post the request

    $("#scrape").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // route to scrape express route
        window.location.href = "/scrape";

    });

    $(".delete").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // call API to delete the document
        let saved = $(this)
        let id = saved.parents('div.newcard').attr("data-id");
        $.ajax("/api/delete/article/" + id, {
            type: "DELETE"
        })
            .then(
                function (resp) {
                    // remove the listing on successful delete
                    saved.closest('div.newcard').remove();
                });
    });

});
