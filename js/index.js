window.onload = function() {

    var keywordsFieldset = document.getElementById('keywords'),
        imagesFieldset = document.getElementById('images')

    // Get the saved filters from the background worker
    chrome.runtime.sendMessage({
        from: 'mybook-popup',
        subject: 'get-filters'
    })

    document.getElementById('add-filter-btn').onclick = function(e) {
        var d = document.createElement('div')
        d.id = 'filter-wrapper'
        d.innerHTML = '<input class="filter" type="text" placeholder="filter"><i class="fa fa-caret-right"></i><input class="match" type="text" placeholder="match"><button class="remove-filter-btn" type="button"><i class="fa fa-close"></i></button>'
        keywordsFieldset.appendChild(d)
        document.querySelectorAll('.remove-filter-btn').forEach(function(el) {
            el.addEventListener('click', removeFilter)
        })
    }

    document.getElementById('save-btn').onclick = saveFilters

    function initForm(filters) {
        filters.map(function(filter) {
            if (filter.type == 'word-filter') {
                var d = document.createElement('div')
                d.id = 'filter-wrapper'
                d.innerHTML = '<input class="filter" type="text" value="' + word.filter + '"><i class="fa fa-caret-right"></i><input class="match" type="text" value="' + word.match + '"><button class="remove-filter-btn" type="button"><i class="fa fa-close"></i></button>'
                keywordsFieldset.appendChild(d)
            }
        })
        document.querySelectorAll('.remove-filter-btn').forEach(function(el) {
            el.addEventListener('click', removeFilter)
        })
    }

    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-filters-response') {
            initForm(msg.filters)
        }
    })


    // HELPERS
    function removeFilter(e) {
        var filterEl = e.target.parentNode.parentNode
        filterEl.parentNode.removeChild(filterEl)
    }

    function saveFilters() {
        var filters = []
        for (var i = 0; i < keywordsFieldset.children.length; i++) {
            var el = keywordsFieldset.children[i]
            if (el.tagName == 'DIV') {
                filters.push({
                    type: 'word-filter',
                    filter: el.querySelector('.filter').value,
                    match: el.querySelector('.match').value
                })
            }
        }
        
        chrome.runtime.sendMessage({
            from: 'mybook-popup',
            subject: 'set-filters',
            filters: filters
        })

        document.getElementById('saved').style.display = 'inherit'
    }
}
