var ALARM_NAME = 'delay';
var ALARM_FREQUENCY_MINUTES = 10;
var NEWS_URL = 'https://vk.com/feed';


function resolveURL(doc, url) {
    var base = doc.querySelector('base');
    if (!base) {
        base = doc.createElement('base');
        base.href = NEWS_URL;
        doc.head.appendChild(base);
    }

    var tempA = doc.createElement('a');
    tempA.href = url;

    // whoa! magic!
    return tempA.href;
}

function loadFeed(cb) {
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'document';
    xhr.open('GET', NEWS_URL, true);

    xhr.onload = function () {
        cb(xhr.response);
    };

    xhr.send();
}

function parseFeed(cb) {
    loadFeed(function (doc) {
        var feedContainer = doc.getElementById('feed_rows');
        var feedWall = doc.getElementById('feed_wall');

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
                        anchor.setAttribute('href', resolveURL(doc, anchor.href));
                    });
                } catch (ex) {
                    // probably ad row
                    row.remove();
                }
            });

            // add stylesheets list
            [].forEach.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (stylesheet) {
                output.stylesheets.push(resolveURL(doc, stylesheet.href));
            });

            // remove show more link
            var showMore = doc.getElementById('show_more_link');
            if (showMore) {
                showMore.remove();
            }

            output.html = feedWall.outerHTML;
        }

        cb(output);
    });
}


chrome.alarms.onAlarm.addListener(function (alarmInfo) {
    parseFeed(function (postsData) {
        // calculate new posts
        chrome.storage.local.get({
            seen: []
        }, function (records) {
            var newPostsId = [];

            postsData.posts.forEach(function (postId) {
                if (records.seen.indexOf(postId) === -1) {
                    newPostsId.push(postId);
                }
            });

            // update badge counter
            chrome.browserAction.setBadgeText({'text': newPostsId.length ? String(newPostsId.length) : ''});

            // save html into cache
            chrome.storage.local.set({
                cache: postsData.html,
                stylesheets: postsData.stylesheets
            });
        });
    });
});

chrome.alarms.get(ALARM_NAME, function (alarmInfo) {
    // if (alarmInfo)
    //     return;

    chrome.alarms.create(ALARM_NAME, {
        when: Date.now(),
        periodInMinutes: ALARM_FREQUENCY_MINUTES
    });
});

chrome.browserAction.setPopup({popup: 'popup.html'});
