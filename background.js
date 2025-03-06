var TABID = null;

function parseMove(moveRaw) {
    console.log(moveRaw);
    if (moveRaw.indexOf('bestmove') > -1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(TABID) {
                var bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') - 1);
                chrome.scripting.executeScript({
                    target: {tabId: TABID},
                    func: (bestmove) => {
                        chrome.runtime.sendMessage({type: 'draw_best_move', text: bestmove});
                    },
                    args: [bestmove]
                });

                var ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
                chrome.scripting.executeScript({
                    target: {tabId: TABID},
                    func: (ponder) => {
                        chrome.runtime.sendMessage({type: 'draw_ponder_move', text: ponder});
                    },
                    args: [ponder]
                });
            }
        });
    }
}

//init
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    TABID = tabId;
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['js/listener.js']
        }, function() {
            chrome.tabs.sendMessage(tabId, {type: "init"});
        });
    }
});

//listen for messages from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type === 'move_made' || request.type === 'set-level' || request.type === 'set-mode') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(TABID) {
                chrome.scripting.executeScript({
                    target: {tabId: TABID},
                    func: (request) => {
                        chrome.runtime.sendMessage(request);
                    },
                    args: [request]
                });
            }
        });
    }
    sendResponse();
});
