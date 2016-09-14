/*
    This script get injected into facebook

    Samuel Steele <@cryptoc1>
*/

window.onload = function() {
    console.log('*** SCRIPT LOADED INTO PAGE ***')

    // Globals
    var scrollOffset = 0

    // Request the filters from the background worker
    chrome.runtime.sendMessage({
        from: 'mybook-injected',
        subject: 'get-words'
    })

    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-words-response') {

            // TODO: Make this so that I don't have to embed all the logic in the listener

            var words = msg.words

            scrapeContents()

            document.addEventListener('click', function(e) {
                // handle when the user expands comment boxes on posts
                if (e.target.className == '_ipm' || e.target.className == 'UFIPagerLink') {
                    // Wait half a second for the comments to load into the DOM
                    setTimeout(function() {
                        scraper('.UFICommentContent .UFICommentBody')
                    }, 500)
                }
            })

            document.addEventListener('mousewheel', function(e) {
                // TODO: use some sort of index to mark where we've already scrolled down to
                if (window.scrollY > scrollOffset) {
                    // Indicates the user is scrolling down the page, so new posts are going to get loaded

                    scrapeContents()
                }
                scrollOffset = window.scrollY
            }, {
                passive: true
            })

            function scrapeContents() {
                // wrapper function
                scraper('.userContent')
                scraper('.UFICommentContent .UFICommentBody')
            }

            function scraper(query) {
                var elems = document.querySelectorAll(query)
                for (var i = 0; i < elems.length; i++) {
                    var el = elems[i]
                    if (!el.getAttribute('mybook-set')) {
                        // It just so happens that comment blocks and user-content blocks text is stored int he first child
                        if (el.children.length > 0) {
                            el.children[0].textContent = replaceWords(el.children[0].textContent)
                        }
                        el.setAttribute('mybook-set', 'true')
                    }

                }
            }

            function replaceWords(str) {
                for (var i = 0; i < words.length; i++) {
                    str = str.replaceAll(words[i].filter, words[i].match)
                }
                return str
            }
        }
    })
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
