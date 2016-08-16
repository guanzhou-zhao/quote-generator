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
    })
}

var load_sublist = function(evt) {
  evt.preventDefault();
    var main = $(".p_main .container")
    var target = $(evt.target)
    $.ajax({
        url: target.attr("href"),
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log(data)
// make pagination
// Hidden pagination if there is no next and prev links
        var pagination = $(".p_main nav")
        if (data._links.next || data._links_prev) {
          pagination.show()
          var prev_link = $(".p_main nav .pager:first-child")
          var next_link = $(".p_main nav .pager:last-child")
          if (data._links.prev) {
            prev_link.show()
            prev_link.children().first().attr("href", data._links_prev).click(load_sublist)
          } else {
            prev_link.hide()
          }

          if (data._links.next) {
            next_link.show()
            next_link.children().first().attr("href", data._links_next).click(load_sublist)
          } else {
            next_link.hide()
          }
        } else {
          pagination.hide()
        }

//Generate html for loaded data
            var col_pre_row = 3;
            var row = $("<div>").addClass("row")
            data.streams.reduce(function(preV, stream) {
                if (col_pre_row == 0) {
                  row = $("<div>").addClass("row")
                  col_pre_row = 3
                }
                var col = $("<div>").addClass("col-md-" + 12 / 3).appendTo(row)
                col_pre_row--
                var thumbnail = $("<div>").addClass("thumbnail").appendTo(col)

                var image = $("<img>").attr("src", stream.preview.medium).attr("alt", stream.game).appendTo(thumbnail)

                var caption = $("<div>").addClass("caption").insertAfter(image);

                caption.append($("<h3>").text(stream.game))

                return main.append(row)
            }, main)

        }
    })
}
