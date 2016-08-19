$(document).ready(function() {

    make_menu();
})

var make_menu = function() {
    $.get("https://api.twitch.tv/kraken", function(data, status) {
        var links = data._links;

        var list = $("<ul>").addClass("menu nav nav-tabs");

        Object.getOwnPropertyNames(links).reduce(function(preV, propName) {
            var anchor = $("<a>").attr("href", links[propName]).text(propName);
            var list_item = $("<li>").attr("role", "presentation").addClass("menu-item").append(anchor);
            if (propName == "streams") {
                list_item.addClass("active")
            }
            list_item.click(load_sublist)

            list.append(list_item)
            return list;
        }, list)

        $(".p_nav .container").append(list);
        $("li.active a").click()
    })
}

var load_sublist = function(evt) {
    evt.preventDefault();

    var main = $(".p_main .container")
        // Clear previously loaded data
    main.find(".row, .alert").remove()
    var target = $(evt.target)

    // Add .active for target
    target.parent().siblings().removeClass("active")
    target.parent().addClass("active")

    // for the leading 3 menu button, don't run ajax method
    var button_name = target.text()
    if (button_name == "user" || button_name == "channel" || button_name == "search") {
        main.find("nav").hide()

        var errorMsg = $("<div>").addClass("alert alert-danger").attr("role", "alert")
        errorMsg.text("Unauthorized" + "! " + "Token invalid or missing required scope" + ".")

        var promptMsg = $("<div>").addClass("alert alert-info").attr("role", "alert")
        promptMsg.text("Please do try other menu buttons.")

        $(".p_main .container").append(errorMsg).append(promptMsg)
        return
    }

    $.ajax({
        url: target.attr("href"),
        type: "GET",
        dataType: "json",
        beforeSend: function() {
            $(".loading").show();
            $(".p_main nav").hide();
        },
        complete: function() {
            $(".loading").hide();
            $(".p_main nav").show();
        },
        // error: function(jqXHR, textStatus, errorThrown) {
        //   var errorMsg = $("<div>").addClass("alert alert-danger").attr("role", "alert")
        //   errorMsg.text(textStatus + "! " + errorThrown + ".")
        //
        //   var promptMsg = $("div").addClass("alert alert-info").attr("role", "alert")
        //   promptMsg.text("Please do try other menu buttons.")
        //
        //   main.append(errorMsg).append(promptMsg)
        //   return
        // },
        success: function(data) {
            console.log(data)
                // make pagination
                // Hidden pagination if there is no next and prev links
            var pagination = $(".p_main nav")
            if (data._links.next || data._links_prev) {
                pagination.show()
                var prev_link = $(".p_main nav .pager li:first-child").children().eq(0)
                var next_link = $(".p_main nav .pager li:last-child").children().eq(0)
                if (data._links.prev) {
                    prev_link.show()
                    prev_link.attr("href", data._links.prev)

                    // Add click event listener only if there is no listener added
                    if (!$._data(prev_link[0], "events")) {
                        prev_link.click(load_sublist)
                    }
                } else {
                    prev_link.hide()
                }

                if (data._links.next) {
                    next_link.show()
                    next_link.attr("href", data._links.next)

                    // Add click event listener only if there is no listener added
                    if (!$._data(next_link[0], "events")) {
                        next_link.click(load_sublist)
                    }
                } else {
                    next_link.hide()
                }
            } else {
                pagination.hide()
            }

            //Generate html element for loaded data
            var data_name
            if (data.streams) {
                data_name = "streams"
            } else if (data.teams) {
                data_name = "teams"
            } else if (data.ingests) {
                data_name = "ingests"
            } else {
                return
            }

            var col_pre_row = 3;
            var row = $("<div>").addClass("row")
            data[data_name].reduce(function(preV, data_item) {
                if (col_pre_row == 0) {
                    row = $("<div>").addClass("row")
                    col_pre_row = 3
                }
                var col = $("<div>").addClass("col-md-" + 12 / 3).appendTo(row)
                col_pre_row--
                var thumbnail = $("<div>").addClass("thumbnail").appendTo(col)

                // prepare image && caption text
                var image
                var caption_text
                if (data.streams) {
                    image = $("<img>").attr("src", data_item.preview.medium).attr("alt", data_item.game)
                    caption_text = data_item.game
                } else if (data.teams) {
                    image = $("<img>").attr("src", data_item.logo).attr("alt", data_item.name)
                    caption_text = data_item.name
                } else {
                    image = $("<img>").attr("src", "http://placehold.it/300x300").attr("alt", data_item.name)
                    caption_text = data_item.name
                }
                image.appendTo(thumbnail)

                var caption = $("<div>").addClass("caption").insertAfter(image);

                caption.append($("<h3>").text(caption_text))

                var data_text = "\" " + caption_text + " \". (Content from dev.twitch.tv API)"

                var tweet_button = $("<a>")
                tweet_button.attr("href", "https://twitter.com/share")
                    .addClass("twitter-share-button")
                    .attr("data-size", "large")
                    .attr("data-text", data_text)
                    .attr("data-via", "guanzhou_z")
                    .attr("data-hashtags", "quote_generator")
                    .attr("data-related", "DevAcademyNZ,guanzhou_z")
                    .attr("data-show-count", "false")
                    .text("Tweet")

                caption.append($("<p>").append(tweet_button))
                return main.append(row)
            }, main)

            main.find("script").remove()
            main.append($("<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"))
        }
    })
}
