var playingAs = 1; // 1 white, 2 black
var query = "wc-simple-move-list";

var observerMoves = new MutationObserver(function (mutations) {
	const element = document.querySelectorAll(query);

	// Ensure the element exists and is properly loaded
	if (element.length === 0) {
		console.error("Element MOVE LIST not found.");
		return;
	}

	// Wrap the async calls in a promise to handle them correctly
	getFENAndPlayingAs(element.item(0))
		.then(({ FEN, playingAs }) => {
			window.postMessage(
				{
					type: "move_made",
					playingAs: playingAs,
					FEN: FEN,
				},
				"*"
			);
		})
		.catch((error) => {
			console.error("Error resolving FEN and PlayingAs:", error);
		});
});

// Function to return a promise that resolves when `FEN` and `playingAs` are available
function getFENAndPlayingAs(element) {
	return new Promise((resolve, reject) => {
		console.warn('getFENAndPlayingAs called');// This is not logged
		// Check for board and game properties before proceeding
		if (!element.board || !element.board.game) {// This is not logged
			console.error("Board or game not found on the element");
			reject("Board or game not available");
			return;
		}

		console.log("Accessing FEN and PlayingAs...");// This is not logged
		// Attempt to access FEN and Playing As
		Promise.all([
			element.board.game.getFEN(),
			element.board.game.getPlayingAs()
		])
			.then(([FEN, playingAs]) => {
				console.log("FEN:", FEN);
				console.log("Playing As:", playingAs);
				resolve({ FEN, playingAs });
			})
			.catch((error) => {
				console.error("Error getting FEN or PlayingAs:", error);
				reject(error);
			});
	});
}

function addObserverIfDesiredNodeAvailable() {
	const elements = document.querySelectorAll(query);

	if (!elements || elements.length === 0) {
		console.error("Element MOVE LIST not found or not available yet.");
		// Increase delay to give the element more time to load
		window.setTimeout(addObserverIfDesiredNodeAvailable, 1000); // Increased timeout
		return;
	}

	const element = elements.item(0);
	// console.dir(element); // Initial log (may not have `board`)

	if (element.board && element.board.game) {
		console.log("Board property found immediately.");
		initializeObserver(element);
	} else {
		console.warn("Board property not found yet. Waiting...");
		waitForBoard(element, initializeObserver);
	}
}

function waitForBoard(element, callback) {
	// Observe changes to the element to check when the board is available
	const observer = new MutationObserver((mutations) => {
		if (element.board && element.board.game) {
			observer.disconnect(); // Stop observing once `board` is found
			callback(element);
		}
	});

	observer.observe(element, { childList: true, subtree: true, attributes: true });
}

async function initializeObserver(element) {
	console.warn("Initializing observer...");// This is not logged
	try {
		console.log(element.board.game); // This is not logged
		console.dir(element.board.game); // This is logged
		console.log(element.board.game.getFEN()); // This is not logged
		console.dir(element.board.game.getFEN()); // This is logged

		// Use promise to resolve the async values
		const { FEN, playingAs } = await getFENAndPlayingAs(element);

		console.warn("THIS LOG IS NOT LOGGED");// This is not logged
		console.warn("FEN:", FEN);// This is not logged
		console.warn("Playing As:", playingAs);// This is not logged

		// Observe move list changes
		const configMoves = { childList: true, subtree: true };
		observerMoves.observe(element, configMoves);
	} catch (error) {
		console.error("Error while accessing board properties:", error);
	}
}

addObserverIfDesiredNodeAvailable();
