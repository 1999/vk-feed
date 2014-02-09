chrome.storage.local.get({
    cache: '',
    stylesheets: [],
    seen: []
}, function (records) {
    records.stylesheets.forEach(function (stylesheet) {
        var elem = document.createElement('link');
        elem.setAttribute('type', 'text/css');
        elem.setAttribute('rel', 'stylesheet');
        elem.setAttribute('href', stylesheet);

        document.head.appendChild(elem);
    });

    var header = [
        '<div class="button_blue" id="fixxx">',
            '<button type="button">Mark all as read</button>',
        '</div>'
    ].join('');

    if (records.cache) {
        var newElemsExist = false;

        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = header + records.cache;

        // clean already read
        [].forEach.call(tempDiv.querySelectorAll('.post'), function (postElem) {
            var id = postElem.id;
            if (records.seen.indexOf(id) !== -1) {
                postElem.parentElement.remove();
            } else {
                newElemsExist = true;
            }
        });

        if (newElemsExist) {
            records.cache = tempDiv.innerHTML;
        } else {
            records.cache = '';
        }
    }

    document.body.innerHTML = records.cache || '<div class="nowrap">No new posts</div>';

    document.getElementById('fixxx').onclick = function () {
        var ids = [].map.call(document.querySelectorAll('.post'), function (postElem) {
            return postElem.id;
        });

        ids.forEach(function (id) {
            if (records.seen.indexOf(id) === -1) {
                records.seen.push(id);
            }
        });

        chrome.storage.local.set({seen: records.seen});
        document.body.innerHTML = '<div class="nowrap">Everything is marked as read</div>';
        chrome.browserAction.setBadgeText({'text': ''});
    };
});
