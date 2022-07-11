// Level 1 AI = ~850
// Level 2 AI = ~950
// Level 3 AI = ~1050
// Level 4 AI = ~1250
// Level 5 AI = ~1700
// Level 6 AI = ~1900
// Level 7 AI = ~2000
// Level 8 AI = ~2250

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {// callback function not used in favor of async, tab specific response
//     if(request.type === 'move_made') {
//         stockfish.postMessage('position fen ' + request.text);
//         stockfish.postMessage('go movetime 200');
//     }
// });

var TABID = null;

function parseMove(moveRaw) {
    if (moveRaw.indexOf('bestmove') > -1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(TABID) {
                var bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') -1);
                var ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
                console.log(bestmove);
                console.log(ponder);
                chrome.tabs.sendMessage(TABID, {type: 'draw_best_move', text: bestmove});
                chrome.tabs.sendMessage(TABID, {type: 'draw_ponder_move', text: ponder});
            }
        });
    }
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    TABID = tabId;
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, {type: 'init'});
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "draw_canvas"){
        console.log("starting fen: " + request.FEN);
        var stockfish = new Worker(chrome.extension.getURL('lib/stockfish.js'));
        stockfish.postMessage('uci');
        stockfish.postMessage('isready');
        stockfish.postMessage('ucinewgame');
        stockfish.postMessage('position fen ' + request.FEN);
        stockfish.postMessage('setoption name Skill Level value 3');
        stockfish.postMessage('go depth 10');
        stockfish.onmessage = function(event) {
            parseMove(event.data);
        }
        stockfish.postMessage('go movetime 200');
    }
    sendResponse();
});
