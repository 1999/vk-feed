var feedContainer = document.getElementById('feed_rows');
var feedWall = document.getElementById('feed_wall');

function resolveURL(url) {
    var base = document.querySelector('base');
    if (!base) {
        base = document.createElement('base');
        base.href = location.href;
        document.head.appendChild(base);
    }

    var tempA = document.createElement('a');
    tempA.href = url;

    // whoa! magic!
    return tempA.href;
}

var output = {
    posts: [],
    stylesheets: [],
    html: ''
};

if (feedContainer) {
    [].forEach.call(feedContainer.querySelectorAll(".feed_row"), function (row) {
        try {
            var postId = row.querySelector(".post").id;
            output.posts.push(postId);

            [].forEach.call(row.querySelectorAll("a"), function (anchor) {
                anchor.setAttribute('target', '_blank');
                anchor.setAttribute('href', resolveURL(anchor.href));
            });
        } catch (ex) {
            // probably ad row
            row.remove();
        }
    });

    // add stylesheets list
    [].forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (stylesheet) {
        output.stylesheets.push(resolveURL(stylesheet.href));
    });

    // remove show more link
    var showMore = document.getElementById('show_more_link');
    if (showMore) {
        showMore.remove();
    }

    output.html = feedWall.outerHTML;
}

output;
