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
        subject: 'get-filters'
    })

    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-filters-response') {

            // TODO: Make this so that I don't have to embed all the logic in the listener

            var filters = msg.filters

            /*filters.map(function(filter) {
                if (filter.type == 'image-filter') {
                    imageFilter = filter
                }
            })*/

            scrapeContents()
            filterImages()

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
                    filterImages()
                }
                scrollOffset = window.scrollY
            }, {
                passive: true
            })


            // HELPERS

            function filterImages() {
                // TODO: find a better way to do this
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i].type == 'image-filter') {
                        imageFilter = filters[i]
                        document.querySelectorAll('.scaledImageFitWidth').forEach(function(img) {
                            img.style.filter = imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')'
                            img.style.WebkitFilter = imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')'
                                // console.log(imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')')
                        })
                    }
                }
            }

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
                            el.children[0].textContent = filterText(el.children[0].textContent)
                        }
                        el.setAttribute('mybook-set', 'true')
                    }

                }
            }

            function filterText(str) {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i].type == 'word-filter')
                        str = str.replaceAll(filters[i].filter, filters[i].match)
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
