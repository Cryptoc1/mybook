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

    // Handle IPC message
    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-filters-response') {

            // TODO: Make this so that I don't have to embed all the logic in the listener

            var filters = msg.filters

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
                console.log('filtering images')
                // TODO: find a better way to do this
                imageFilter = filters.imageFilter
                var images = document.querySelectorAll('.scaledImageFitWidth')
                console.log(images)
                for (var i = 0; i < images.length; i++) {
                    var img = images[i]
                    console.log(img)
                    img.style.filter = imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')'
                    img.style.WebkitFilter = imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')'
                        // console.log(imageFilter.filter + '(' + imageFilter.level + ((imageFilter.filter == 'blur') ? 'px' : '%') + ')')
                }
            }

            function scrapeContents() {
                // wrapper function
                scraper('.userContent')
                scraper('.UFICommentContent .UFICommentBody')
            }

            function scraper(query) {
                document.querySelectorAll(query).forEach(function(el) {
                    // Trying to save some performence here by not manipulating the DOM when uneeded
                    if (!el.getAttribute('mybook-set')) {
                        // It just so happens that comment block's and user-content block's text is stored in the first child
                        if (el.children.length > 0) {
                            el.children[0].textContent.filterText()
                        }
                        el.setAttribute('mybook-set', 'true')
                    }

                })

                /*for (var i = 0; i < elems.length; i++) {
                    var el = elems[i]
                    if (!el.getAttribute('mybook-set')) {
                        // It just so happens that comment block's and user-content block's text is stored in the first child
                        if (el.children.length > 0) {
                            el.children[0].textContent.filterText()
                        }
                        el.setAttribute('mybook-set', 'true')
                    }
                }*/
            }

            function filterText(str) {
                f = filters.wordFilters
                for (var i = 0; i < f.length; i++) {
                    str = str.replaceAll(f[i].filter, f[i].match)
                }
                return str
            }

            String.protoype.filterText = function() {
                f = filters.wordFilters
                    // Run the string through each filter
                for (var i = 0; i < f.length; i++) {
                    this.replaceAll(f[i].filter, f[i].match)
                }
                return this
            }
        }
    })
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
