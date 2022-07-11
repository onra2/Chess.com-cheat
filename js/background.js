// Level 1 AI = ~850
// Level 2 AI = ~950
// Level 3 AI = ~1050
// Level 4 AI = ~1250
// Level 5 AI = ~1700
// Level 6 AI = ~1900
// Level 7 AI = ~2000
// Level 8 AI = ~2250

var stockfish = new Worker(chrome.extension.getURL('lib/stockfish.js'));
stockfish.postMessage('uci');
stockfish.postMessage('isready');
stockfish.postMessage('ucinewgame');
stockfish.postMessage('setoption name Skill Level value 3');
stockfish.postMessage('go depth 10');

stockfish.onmessage = function(event) {
    parseMove(event.data);
}

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  // callback function not used in favor of async, tab specific response
//     tabId = sender.tab.id;
//     if(request.type === 'move_made') {
//         stockfish.postMessage('position fen ' + request.text);
//         stockfish.postMessage('go movetime 200');
//     }
// });

// chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete' && tab.active) {
//         console.log("bonjour");
//     }
// });

function parseMove(moveRaw) {
    if (moveRaw.indexOf('bestmove') > -1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) {
                var move = moveRaw.slice(9, moveRaw.indexOf('ponder') -1);
                //console.log(move);
                chrome.tabs.sendMessage(currTab.id, {type: 'draw_best_move', text: move});
            }
        });
    }
}