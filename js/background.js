var words = JSON.parse(localStorage.getItem('words'))

chrome.runtime.onMessage.addListener(function(msg, sender) {
    switch (msg.from) {
        case 'mybook-popup':
            switch (msg.subject) {
                case 'get-words':
                    chrome.runtime.sendMessage({
                        from: 'mybook-background',
                        subject: 'get-words-response',
                        words: words
                    })
                    break
                case 'set-words':
                    words = msg.words
                    localStorage.setItem('words', JSON.stringify(msg.words))
                    break
            }
            break
        case 'mybook-injected':
            switch (msg.subject) {
                case 'get-words':
                    console.log('got message from content script')
                    chrome.tabs.sendMessage(sender.tab.id, {
                        from: 'mybook-background',
                        subject: 'get-words-response',
                        words: words
                    })
                    break
            }
            break
    }
})
