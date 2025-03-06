// content.js

// Inject the script to extract the FEN from the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
document.head.appendChild(script);

var rank = ["a", "b", "c", "d", "e", "f", "g", "h"];
var rankBlack = ["h", "g", "f", "e", "d", "c", "b", "a"];
var point = [];

function initializeBlack(board) {
    board.position = "relative";
    var itemWidth = board.offsetWidth / 8;
    var itemHeight = board.offsetHeight / 8;
    for (var x = 0; x < 8; x++) {
        var width = itemWidth * (x + 1);
        for (var y = 1; y < 9; y++) {
            var coord = rankBlack[x] + y;
            point[coord] = {
                width: width - itemWidth / 2,
                height: itemHeight * y - itemHeight / 2,
            };
        }
    }
}

function initializeWhite(board) {
    board.position = "relative";
    var itemWidth = board.offsetWidth / 8;
    var itemHeight = board.offsetHeight / 8;
    for (var x = 0; x < 8; x++) {
        var width = itemWidth * (x + 1);
        for (var y = 8; y > 0; y--) {
            var coord = rank[x] + y;
            point[coord] = {
                width: width - itemWidth / 2,
                height: itemHeight * (9 - y) - itemHeight / 2,
            };
        }
    }
}

function getActiveColorFromFEN(FEN) {
    var activeColor = FEN.split(" ")[1];
    if (activeColor == "w") {
        return 1;//white
    } else {
        return 2;
    }
}

function drawBestMove(bestmove){
    var moveFrom = bestmove.substring(0, 2);
    var moveTo = bestmove.substring(2, 4);

    var pf = point[moveFrom];
    var pt = point[moveTo];

    $('#canvas').drawLine({
        strokeStyle: "rgba(24, 171, 219, 0.8)",//blue
        strokeWidth: 8,
        rounded: true,
        endArrow: true,
        startArrow: false,
        arrowRadius: 15,
        arrowAngle: 45,
        x1: pf.width, y1: pf.height,
        x2: pt.width, y2: pt.height
    });
}

// Load Stockfish as a Worker in the content script
const stockfish = new Worker(chrome.runtime.getURL('lib/stockfish.js'));
// Initialize Stockfish
stockfish.postMessage('uci');
stockfish.postMessage('setoption name Skill Level value 5');
stockfish.onmessage = function (event) {
    const moveRaw = event.data;
    if (moveRaw.indexOf('bestmove') > -1) {
        const bestmove = moveRaw.slice(9, moveRaw.indexOf('ponder') - 1);
        drawBestMove(bestmove);
        // window.postMessage({ type: 'draw_best_move', text: bestmove }, '*');

        const ponder = moveRaw.slice(moveRaw.indexOf('ponder') + 7, moveRaw.length);
        // window.postMessage({ type: 'draw_ponder_move', text: ponder }, '*');
    }
};

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_INIT_GAME_INFO') {
        const gameInfo = {
            fen: event.data.gameInfo.fen,
            playingAs: event.data.gameInfo.playingAs,
        }
        // console.log('gameInfo 1:', gameInfo.fen);
        // console.log('gameInfo 2:', gameInfo.playingAs);

        var chessBoard = document.querySelector('wc-chess-board');
        // console.log('chessBoard:', chessBoard);
        if (gameInfo.playingAs === 1) {
            initializeWhite(chessBoard);
        }
        else {
            initializeBlack(chessBoard);
        }

        var canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.width = chessBoard.offsetWidth;
        canvas.height = chessBoard.offsetHeight;
        canvas.style.position = "absolute";
        canvas.style.left = 0;
        canvas.style.top = 0;

        chessBoard.appendChild(canvas);
        stockfish.postMessage('position fen ' + gameInfo.fen);
        stockfish.postMessage('go movetime 200');
    }
    if (event.data && event.data.type === 'move_made') {
        const gameInfo = {
            fen: event.data.gameInfo.fen,
            playingAs: event.data.gameInfo.playingAs,
        }
        console.log('gameInfo 3:', gameInfo.fen);
        console.log('gameInfo 4:', gameInfo.playingAs);

        $("#canvas").clearCanvas();
        if (getActiveColorFromFEN(gameInfo.fen) == gameInfo.playingAs) {
            stockfish.postMessage('position fen ' + gameInfo.fen);
            stockfish.postMessage('go movetime 200');
        }
    }
});


//listen to background.js
// chrome.runtime.onMessage.addListener(function (result) {
//     if (result.type === 'draw_best_move' && result.text) {
//         var moveFrom = result.text.substring(0, 2);
//         var moveTo = result.text.substring(2, 4);

//         var pf = point[moveFrom];
//         var pt = point[moveTo];

//         $('#canvas').drawLine({
//             strokeStyle: "rgba(24, 171, 219, 0.8)",//blue
//             strokeWidth: 8,
//             rounded: true,
//             endArrow: true,
//             startArrow: false,
//             arrowRadius: 15,
//             arrowAngle: 45,
//             x1: pf.width, y1: pf.height,
//             x2: pt.width, y2: pt.height
//         });
//     }
//     // if (result.type === 'draw_ponder_move' && result.text) {
//     //     var moveFrom = result.text.substring(0, 2);
//     //     var moveTo = result.text.substring(2, 4);

//     //     var pf = point[moveFrom];
//     //     var pt = point[moveTo];

//     //     $('#canvas').drawLine({
//     //         strokeStyle: "rgba(191,63,63,0.8)",//red
//     //         strokeWidth: 8,
//     //         rounded: true,
//     //         endArrow: true,
//     //         startArrow: false,
//     //         arrowRadius: 15,
//     //         arrowAngle: 45,
//     //         x1: pf.width, y1: pf.height,
//     //         x2: pt.width, y2: pt.height
//     //     });
//     // }
// });