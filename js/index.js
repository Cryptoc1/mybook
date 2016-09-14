window.onload = function() {

    var keywordsFieldset = document.getElementById('keywords')

    chrome.runtime.sendMessage({
        from: 'mybook-popup',
        subject: 'get-words'
    })

    document.getElementById('add-filter-btn').onclick = function(e) {
        var d = document.createElement('div')
        d.innerHTML = '<input class="filter" type="text" placeholder="filter"><i class="fa fa-caret-right"></i><input class="match" type="text" placeholder="match">'
        keywordsFieldset.appendChild(d)
    }

    document.getElementById('save-btn').onclick = function(e) {
        var words = []
        for (var i = 0; i < keywordsFieldset.children.length; i++) {
            var el = keywordsFieldset.children[i]
            if (el.tagName == 'DIV') {
                words.push({
                    filter: el.querySelector('.filter').value,
                    match: el.querySelector('.match').value
                })
            }
        }

        chrome.runtime.sendMessage({
            from: 'mybook-popup',
            subject: 'set-words',
            words: words
        })

        document.getElementById('saved').style.display = 'inherit'
    }


    function initForm(words) {
        words.map(function(word) {
            var d = document.createElement('div')
            d.innerHTML = '<input class="filter" type="text" value="' + word.filter + '"><i class="fa fa-caret-right"></i><input class="match" type="text" value="' + word.match + '">'
            keywordsFieldset.appendChild(d)
        })
    }

    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-words-response') {
            initForm(msg.words)
        }
    })
}
