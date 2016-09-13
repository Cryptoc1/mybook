/*
    This script get injected into facebook

    Samuel Steele <@cryptoc1>
*/

window.onload = function() {
    console.log('*** SCRIPT LOADED INTO PAGE ***')

    // Globals
    var scrollOffset = 0,
        words = [{
            filter: 'the',
            match: '***++THE++***'
        }]

    scrapeComments()

    document.addEventListener('mousewheel', function(e) {
        // TODO: use some sort of index to mark where we've already scrolled down to
        if (window.scrollY > scrollOffset) {
            // Indicates the user is scrolling down the page, so new posts are going to get loaded
            scrapeComments()
        }
        scrollOffset = window.scrollY
    })

    function scrapeComments() {
        var commentBlocks = document.querySelectorAll('.UFICommentContent .UFICommentBody')
        for (var i = 0; i < commentBlocks.length; i++) {
            var el = commentBlocks[i]
            if (!el.getAttribute('mybook-set')) {
                // console.log(el)
                el.children[0].textContent = replaceWords(el.children[0].textContent)
            }
        }
    }

    function replaceWords(str) {
        for (var i = 0; i < words.length; i++) {
            str = str.replace(words[i].filter, words[i].match)
        }
        console.log(str)
        return str
    }
}
