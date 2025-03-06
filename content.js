let stockfish = new Worker(chrome.runtime.getURL('lib/stockfish.js'));
let mode = "go depth 8";

function parseMove(moveRaw) {
    console.log(moveRaw);
    if (moveRaw.indexOf('bestmove') > -1) {
        let bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') - 1);
        chrome.runtime.sendMessage({type: 'draw_best_move', text: bestmove});

        let ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
        chrome.runtime.sendMessage({type: 'draw_ponder_move', text: ponder});
    }
}

stockfish.onmessage = function(event) {
    parseMove(event.data);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type == "init"){
        stockfish.postMessage('uci');
        stockfish.postMessage('setoption name Skill Level value 8');
        stockfish.postMessage('setoption name Threads 8');
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
            mode = "go depth 8";
        }else{
            mode = "go depth 15";
        }
    }
    sendResponse();
});
