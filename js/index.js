window.onload = function() {

    var keywordsFieldset = document.getElementById('keywords'),
        imagesFieldset = document.getElementById('images'),
        selectEl = imagesFieldset.children[1].children[0]


    // Get the saved filters from the background worker
    chrome.runtime.sendMessage({
        from: 'mybook-popup',
        subject: 'get-filters'
    })

    // Handle the incoming message
    chrome.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.from == 'mybook-background' && msg.subject == 'get-filters-response') {
            initForm(msg.filters)
        }
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
        filters.wordFilters.map(function(word) {
            var d = document.createElement('div')
            d.id = 'filter-wrapper'
            d.innerHTML = '<input class="filter" type="text" value="' + word.filter + '"><i class="fa fa-caret-right"></i><input class="match" type="text" value="' + word.match + '"><button class="remove-filter-btn" type="button"><i class="fa fa-close"></i></button>'
            keywordsFieldset.appendChild(d)
        })

        selectEl.querySelector('option[value="' + filters.imageFilter.filter + '"]').setAttribute('selected', 'true')
        selectEl.parentNode.querySelector('input').value = filters.imageFilter.level

        document.querySelectorAll('.remove-filter-btn').forEach(function(el) {
            el.addEventListener('click', removeFilter)
        })
    }

    function removeFilter(e) {
        // e.target is the close 'x' element
        var filterEl = e.target.parentNode.parentNode
        filterEl.parentNode.removeChild(filterEl)
        saveFilters()
    }

    function saveFilters() {
        var filters = {
            wordFilters: [],
            imageFilter: {
                type: 'image-filter',
                filter: selectEl.children[selectEl.selectedIndex].value,
                level: imagesFieldset.children[1].children[1].value
            }
        }

        // Iterate through each filter
        for (var i = 0; i < keywordsFieldset.children.length; i++) {
            var el = keywordsFieldset.children[i]
            if (el.tagName == 'DIV') {
                filters.wordFilters.push({
                    type: 'word-filter',
                    filter: el.querySelector('.filter').value,
                    match: el.querySelector('.match').value
                })
            }
        }

        // Send the filters to the background worker to be saved
        chrome.runtime.sendMessage({
            from: 'mybook-popup',
            subject: 'set-filters',
            filters: filters
        })

        // Inform the user to refresh the page
        document.getElementById('saved').style.display = 'inherit'
    }
}
