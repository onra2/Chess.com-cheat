function injectJavaScript(scriptName, callback) {
	var script = document.createElement("script");
	script.src = chrome.extension.getURL(scriptName);
	script.addEventListener("load", callback, false);
	(document.head || document.documentElement).appendChild(script);
}

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

//listen to injected script
window.addEventListener("message", function (event) {
	//add the canvas
	if (event.data.type === "init") {
		var chessBoard = document.querySelector('.chessboard, .board, chess-board');
		var playingAs = event.data.playingAs;
		if (playingAs === 1) {
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
		chrome.runtime.sendMessage(event.data, function (response) {});
	}
	//make a move in stockfish background
	if (event.data.type === "move_made") {
		$("#canvas").clearCanvas();
		if(getActiveColorFromFEN(event.data.FEN) == event.data.playingAs){
			chrome.runtime.sendMessage(event.data, function (response) {});
		}
	}
});

//listen to background.js
chrome.runtime.onMessage.addListener(function(result) {
	if(result.type === "init"){
		injectJavaScript("js/listener.js", function () {
		    console.log("injected listener.js");
		});
	}
    if(result.type === 'draw_best_move' && result.text) {
        var moveFrom = result.text.substring(0, 2);
        var moveTo = result.text.substring(2, 4);

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
	if(result.type === 'draw_ponder_move' && result.text) {
        var moveFrom = result.text.substring(0, 2);
        var moveTo = result.text.substring(2, 4);

        var pf = point[moveFrom];
        var pt = point[moveTo];

        $('#canvas').drawLine({
            strokeStyle: "rgba(191,63,63,0.8)",//red
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
});

