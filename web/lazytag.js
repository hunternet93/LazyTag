function handlemessage(event) {
    data = JSON.parse(event.data);
    
    if (data.game !== undefined) {
        if (data.game.state !== undefined) {
            document.getElementById('gamestate').innerHTML = data.game.state;
        }
        if (data.game.mode !== undefined) {
            document.getElementById('gamemode').innerHTML = data.game.mode;
        }
    }
    
    else if (data.player !== undefined) {}
        // remember - ordering player list: document.getElementById('body').insertBefore(ele1, ele2);
        
        
}

function sendevent(event) {
    websocket.send(JSON.stringify(event));
}

var gamesettings_state = false
function togglesettings() {
    if (!gamesettings_state) {
        document.getElementById('gamesettings').classList.add('expand');
        gamesettings_state = true;
    }
    
    else {
        document.getElementById('gamesettings').classList.remove('expand');
        gamesettings_state = false;
    }
}

if (window.location.hostname == '') {
    // Page is loaded locally for development, not hosted on a server.
    websocket = new WebSocket('ws://localhost:8765/');
}
else {
    websocket = new WebSocket('ws://' + window.location.hostname + ':8765/');
}

websocket.onmessage = handlemessage;
websocket.onopen = function (event) {
    websocket.send('{"type": "web"}');
}

//TODO write connection error handle code
