var playingAs = 1;//1 white, 2 black
var FEN = "";

var observerMoves = new MutationObserver(function(mutations) {
    const element = document.querySelectorAll('.play-controller-moveList.vertical-move-list');
    const FEN = element.item(0).board.game.getFEN();
    window.postMessage({
        type: 'move_made',
        FEN: FEN,
    }, '*');
});

function addObserverIfDesiredNodeAvailable() {
    const element = document.querySelectorAll('.play-controller-moveList.vertical-move-list');
    if(!element) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(addObserverIfDesiredNodeAvailable,500);
        return;
    }
    else if(element.length == 0) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(addObserverIfDesiredNodeAvailable,500);
        return;
    }
    else{
        //init canvas
        FEN = element.item(0).board.game.getFEN();
        playingAs = element.item(0).board.game.getPlayingAs();
        window.postMessage({
            type: 'init',
            playingAs: playingAs,
            FEN: FEN
        }, '*');

        //observe movelist changes
        var configMoves = {
            childList: true, 
            subtree: true, 
            attributes: false, 
            characterData: false
        };
        observerMoves.observe(element.item(0), configMoves);
    }
}

addObserverIfDesiredNodeAvailable();