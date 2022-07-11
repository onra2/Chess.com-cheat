function injectJavaScript(scriptName, callback) {
	var script = document.createElement("script");
	script.src = chrome.extension.getURL(scriptName);
	script.addEventListener("load", callback, false);
	(document.head || document.documentElement).appendChild(script);
}

var rank = ["a", "b", "c", "d", "e", "f", "g", "h"];
var rankBlack = ["h", "g", "f", "e", "d", "c", "b", "a"];
var point = [];
var colors = [
	"rgba(63,191,63,0.8)", // green
	"rgba(191,191,63,0.8)", // yellow
	"rgba(191,127,63,0.8)", // orange
	"rgba(191,63,63,0.8)", // red
	"rgba(24,171,219,0.8)", // blue
];

function getColor(amplifier) {
	var r, g, b, a;
	r = g = b = 255;
	g = g / amplifier;
	var color = "rgba(" + r + "," + g + "," + b + ", 0.5)";
	return color;
}

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

window.addEventListener("message", function (event) {
	if (event.data.type === "draw_canvas") {
		// draw canvas
		var chessBoard = document.querySelector('.chessboard, .board, chess-board');
		//initializeWhite(chessBoard);

		// if(event.data.isWhite)
		// else
		initializeBlack(chessBoard);

		var canvas = document.createElement("canvas");
		canvas.id = "canvas";
		canvas.width = chessBoard.offsetWidth;
		canvas.height = chessBoard.offsetHeight;
		canvas.style.position = "absolute";
		canvas.style.left = 0;
		canvas.style.top = 0;

		chessBoard.appendChild(canvas);
	}

	if (event.data.type === "clear_canvas") {
		$("#canvas").clearCanvas();
	}

	if (event.data.type === "move_made") {
		$("#canvas").clearCanvas();
		chrome.runtime.sendMessage(event.data, function (response) {});
	}
});

chrome.runtime.onMessage.addListener(function(result) {  // extension -> content-script listener
    if(result.type === 'draw_best_move' && result.text) {
        var moveFrom = result.text.substring(0, 2);
        var moveTo = result.text.substring(2, 4);

        var pf = point[moveFrom];
        var pt = point[moveTo];

        $('#canvas').drawLine({
            strokeStyle: colors[4],
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

injectJavaScript("js/listener.js", function () {
    console.log("injected listener.js");
});