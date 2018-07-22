// Once the DOM is fully loaded.
$(function () {

    // on submit scrape button, route to scrap where server does the processing and scarpes and refershes page

    $("#scrape").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // route to scrape express route
        window.location.href = "/scrape";

    });

    // on deleteing a article, call Delete API to remove the article.
    $(".delete").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // call API to delete the document
        let saved = $(this)
        let docid = saved.parents('div.newcard').attr("data-id");
        $.ajax("/api/article/" + docid, {
            type: "DELETE"
        })
            .then(
                function (resp) {
                    // remove the listing on successful delete
                    saved.closest('div.newcard').remove();
                });
    });

    // on clicking the notes, execute load modal funcntion which inturn calls API to get document details
    $(".notes").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // call API to delete the document
        let saved = $(this)
        let docid = saved.parents('div.newcard').attr("data-id");

        loadModal(docid);

    });

    // on clicking add note , add note to the Article by calling post API 
    $("#addnote").on("click", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();

        // call API to Add a note
        let saved = $(this)
        let docid = $('#eModal').attr("data-id");
        $.ajax("/api/article/" + docid, {
            type: "POST",
            data: {
                body: $("#message-text").val().trim()
            }
        })
            .then(
                function (resp) {
                    // load the modal with new note
                    loadModal(resp._id)
                });
    });

    // on clicking delete each note, call API to delet the note
    $(document).on("click",".delnotes", function (event) {
        // Make sure to preventDefault on a submit event.
        event.preventDefault();
      
        // call API to delete the document
        let saved = $(this)
        let noteid = saved.parents('div.notes').attr("data-id");
        
        $.ajax("/api/note/" + noteid, {
            type: "DELETE"
        })
            .then(
                function (resp) {
                    // load the modal with new note
                    loadModal(resp._id)
                });
    });

});

// call the api to get the article along with notes details and render the modal and show
function loadModal(docid) {

    $.ajax("/api/article/" + docid, {
        type: "GET"
    })
        .then(
            function (data) {

                $('#eModal').attr("data-id", data._id);

                $("#message-text").val('');
                $('.modal-title').html('');
                let description = "Notes for: " + data.title.split(' ').slice(0, 3).join(' ') + '...';
                $('.modal-title').html(description);

                $('#notesection').empty();

                if (data.notes.length === 0) {
                    $('#dnotes').css("display", "block");
                } else {
                    $('#dnotes').css("display", "none");
                    data.notes.forEach(i => {
                        let div = $('<div class="notes text-info row">');
                        let p = $('<h6 class="col-sm-11">');
                        let b = $('<button class="delnotes col-sm-1">');
                        let s = $('<span>&times;</span>')
                        p.text(i.body);
                        b.append(s);
                        div.attr("data-id", i._id);
                        div.append(p).append(b);
                        $('#notesection').append(div);
                    });
                }

                $('#eModal').modal('show');

            });
};