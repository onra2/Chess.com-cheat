var popup = setInterval(function () {
    var draw = document.getElementsByClassName('drawResignButtons');

    if (draw.length == 2) {
        var classname = draw[1].getAttribute('class');
        if (classname.indexOf('hidden') == -1) {
            window.alert("game started!")
            clearInterval(blah);
        }
    }
    // $("#AddCards").click(function () { 
    //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //         chrome.tabs.sendMessage(tabs[0].id, {todo: "addCardsToList"}, function(response) {
    //             $("#Names").empty();
    //             let map = new Map(JSON.parse(response.LaRep));
    //             map.forEach((price, member) => {
    //                 $("#Names").append($("<blockquote>"+ member + ": " + Number(price).toFixed(2) + " euro" +"<blockquote>"));
    //             });
    //         });
    //     });
    // });
}, 50);