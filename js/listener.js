var playingAs = 1;//1 white, 2 black
var lastMove = "";
var FEN = "";

var observerMoves = new MutationObserver(function(mutations) {
    console.log("moveList changed");
    lastMove = element.item(0).board.game.getLastMove().san;
    window.postMessage({
        type: 'move_made',
        text: lastMove,
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

        // console.log(element);
        // console.log(element.item(0).board);
        // console.log(element.item(0).board.game.getFEN());
        // console.log(element.item(0).board.game.getPlayingAs());
        // console.log(element.item(0).board.game.getLastMove().san);

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