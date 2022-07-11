var TABID = null;
var stockfish = null;

function parseMove(moveRaw) {
    if (moveRaw.indexOf('bestmove') > -1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(TABID) {
                var bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') -1);
                var ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
                chrome.tabs.sendMessage(TABID, {type: 'draw_best_move', text: bestmove});
                chrome.tabs.sendMessage(TABID, {type: 'draw_ponder_move', text: ponder});
            }
        });
    }
}

//init
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    TABID = tabId;
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, {type: 'init'});
    }
});

//listen for messages from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //first time, create canvas and draw first move
    if(request.type == "init"){
        stockfish = new Worker(chrome.extension.getURL('lib/stockfish.js'));
        stockfish.postMessage('uci');
        stockfish.postMessage('isready');
        stockfish.postMessage('ucinewgame');
        stockfish.postMessage('position fen ' + request.FEN);
        stockfish.postMessage('setoption name Skill Level value 3');
        stockfish.onmessage = function(event) {
            parseMove(event.data);
        }
        stockfish.postMessage('go depth 15');
        stockfish.postMessage('go movetime 200');
    }
    if(request.type === 'move_made') {
        stockfish.postMessage('position fen ' + request.FEN);
        stockfish.postMessage('go movetime 200');
    }
    sendResponse();
});

$("#set-level").click(function () {
    var radioValue = $("input[name='level']:checked").val();
    if(stockfish){
        stockfish.postMessage('setoption name Skill Level value ' + radioValue);
    }
});