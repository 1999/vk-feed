var ALARM_NAME = 'delay';
var ALARM_FREQUENCY_MINUTES = 10;


chrome.alarms.onAlarm.addListener(function (alarmInfo) {
    chrome.tabs.create({
        url: "https://vk.com/feed",
        active: false
    }, function (tab) {
        chrome.tabs.executeScript(tab.id, {
            file: 'content.js'
        }, function (res) {
            var postsData = res[0];

            // close hidden tab
            chrome.tabs.remove(tab.id);

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
});

chrome.alarms.get(ALARM_NAME, function (alarmInfo) {
    if (alarmInfo)
     return;

    chrome.alarms.create(ALARM_NAME, {
        when: Date.now(),
        periodInMinutes: ALARM_FREQUENCY_MINUTES
    });
});

chrome.browserAction.setPopup({popup: 'popup.html'});
