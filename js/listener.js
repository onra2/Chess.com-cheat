var observer = new MutationObserver(function(mutations) {
    var elements = document.querySelectorAll('.piece');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if(element.id.indexOf('dummyBoard') === -1) {
            if(!element.ready) {
                element.ready = true;
                window.postMessage({type: 'draw_canvas'}, '*');
                var chessBoard = element.chessBoard;
                
                //console.log(element.chessBoard);
                if(chessBoard) {
                    // console.log(chessBoard);
                    chessBoard._customEventStacks['onAfterMoveAnimated'].stack.push({
                        callback: function(e) {
                            var fen = chessBoard.getBoardApi().getProperty('selectedFen');

                            var message = {
                                type: 'move_made',
                                text: fen
                            };

                            window.postMessage({ type: 'move_made', text: fen, boardFlip: chessBoard.boardFlip }, '*');
                        }
                    });    

                    chessBoard._customEventStacks['onDropPiece'].stack.push({
                        callback: function(e) {
                            var message = {
                                type: 'clear_canvas'
                            };

                            window.postMessage(message, '*');
                        }
                    });           
                }
            }
        }
    }
});

var observerMoves = new MutationObserver(function(mutations) {
    console.log("moveList changed");
    // const element = document.getElementsByClassName('play-controller-moveList vertical-move-list');
    // console.log(element);
    // console.log(element.length);
    // console.log(element.item(0));
    // for(var i = 0; i < elements.length; i++) {
    //     var element = elements[i];
    //     if(element.id.indexOf('dummyBoard') === -1) {
    //         if(!element.ready) {
    //             element.ready = true;
    //             window.postMessage({type: 'draw_canvas'}, '*');
    //             var chessBoard = element.chessBoard;
                
    //             //console.log(element.chessBoard);
    //             if(chessBoard) {
    //                 // console.log(chessBoard);
    //                 chessBoard._customEventStacks['onAfterMoveAnimated'].stack.push({
    //                     callback: function(e) {
    //                         var fen = chessBoard.getBoardApi().getProperty('selectedFen');

    //                         var message = {
    //                             type: 'move_made',
    //                             text: fen
    //                         };

    //                         window.postMessage({ type: 'move_made', text: fen, boardFlip: chessBoard.boardFlip }, '*');
    //                     }
    //                 });    

    //                 chessBoard._customEventStacks['onDropPiece'].stack.push({
    //                     callback: function(e) {
    //                         var message = {
    //                             type: 'clear_canvas'
    //                         };

    //                         window.postMessage(message, '*');
    //                     }
    //                 });           
    //             }
    //         }
    //     }
    // }
});

function addObserverIfDesiredNodeAvailable() {
    //const element = document.getElementsByClassName('play-controller-moveList vertical-move-list');
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
        console.log(element);
        console.log(element.item(0).board);
        console.log(element.item(0).moveList);

        var configBoard = {
            childList: true, 
            subtree: true, 
            attributes: false, 
            characterData: false
        };
        observer.observe(element.item(0).board, configBoard);

        var config = {
            childList: true, 
            subtree: true, 
            attributes: false, 
            characterData: false
        };
        observerMoves.observe(element.item(0), config);
    }
}

addObserverIfDesiredNodeAvailable();