var TABID = null;
var stockfish = null;
var mode = "go movetime 200";

function parseMove(moveRaw) {
    if (moveRaw.indexOf('bestmove') > -1) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(TABID) {
                var bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') - 1);
                chrome.tabs.sendMessage(TABID, {type: 'draw_best_move', text: bestmove});

                var ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
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
        stockfish.postMessage('setoption name Skill Level value 5');
        stockfish.onmessage = function(event) {
            parseMove(event.data);
        }
        stockfish.postMessage('position fen ' + request.FEN);
        stockfish.postMessage(mode);
    }
    if(request.type === 'move_made') {
        stockfish.postMessage('position fen ' + request.FEN);
        stockfish.postMessage(mode);
    }
    if(request.type === 'set-level') {
        stockfish.postMessage('setoption name Skill Level value ' + request.radioValue);
    }
    if(request.type === 'set-mode') {
        const modeRequest = request.radioValue;
        if(modeRequest == "1"){
            mode = "go movetime 200";
        }else{
            mode = "go depth 15";
        }
    }
    sendResponse();
});
