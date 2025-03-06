var playingAs = 1; //1 white, 2 black

var observerMoves = new MutationObserver(function (mutations) {
	const element = document.querySelectorAll("wc-simple-move-list");
	const FEN = element.item(0).board.game.getFEN();
	playingAs = element.item(0).board.game.getPlayingAs();

	window.postMessage(
		{
			type: "move_made",
			playingAs: playingAs,
			FEN: FEN,
		},
		"*"
	);
});

function waitForBoard(element, callback) {
	const observer = new MutationObserver(() => {
		if (element.board && element.board.game) {
			observer.disconnect(); // Stop observing once `board` is found
			callback(element);
		}
	});

	observer.observe(element, { childList: true, subtree: true, attributes: true });
}

async function addObserverIfDesiredNodeAvailable() {
	const elements = document.querySelectorAll("wc-simple-move-list");

	if (!elements || elements.length === 0) {
		console.error("Element MOVE LIST not found or not available yet.");
		window.setTimeout(addObserverIfDesiredNodeAvailable, 500);
		return;
	}

	const element = elements.item(0);
	console.dir(element); // Initial log (may not have `board`)

	if (element.board && element.board.game) {
		console.log("Board property found immediately.");
		await initializeObserver(element);
	} else {
		console.warn("Board property not found yet. Waiting...");
		waitForBoard(element, initializeObserver);
	}
}

async function initializeObserver(element) {
	try {
		console.dir(element); // Inspect the element itself
		// Check if we can access the properties correctly
		console.dir(element.board.game); // Inspect the game object
		console.dir(element.board.game.getFEN());
		console.dir(element.board.game.getPlayingAs());
		//element.board.game is printed successfully
		//element.board.game.getFEN() is printed successfully
		//element.board.game.getPlayingAs() is printed successfully

		// Await if getFEN() or getPlayingAs() is async
		const FEN = await element.board.game.getFEN();
		const playingAs = await element.board.game.getPlayingAs();

		//these logs are not printed
		console.log("FEN:", FEN);
		console.log("Playing As:", playingAs);
		console.log("??"); // Debugging to ensure flow reaches this point

		// Observe move list changes
		const configMoves = { childList: true, subtree: true };
		observerMoves.observe(element, configMoves);
	} catch (error) {
		console.error("Error while accessing board properties:", error);
	}
}

addObserverIfDesiredNodeAvailable();