var filters = JSON.parse(localStorage.getItem('filters'))

chrome.runtime.onMessage.addListener(function(msg, sender) {
    switch (msg.from) {
        case 'mybook-popup':
            switch (msg.subject) {
                case 'get-filters':
                    chrome.runtime.sendMessage({
                        from: 'mybook-background',
                        subject: 'get-filters-response',
                        filters: filters
                    })
                    break
                case 'set-filters':
                    filters = msg.filters
                    localStorage.setItem('filters', JSON.stringify(msg.filters))
                    break
            }
            break
        case 'mybook-injected':
            switch (msg.subject) {
                case 'get-filters':
                    chrome.tabs.sendMessage(sender.tab.id, {
                        from: 'mybook-background',
                        subject: 'get-filters-response',
                        filters: filters
                    })
                    break
            }
            break
    }
})
