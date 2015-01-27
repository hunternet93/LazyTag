var player_cols = [
    'name',
    'connected',
    'power',
    'id'
]

var players = {};

var gamestate = null;

function Player(id) {
    var me = this; // I wish javascript was Python... stupid namespaces.

    this.row = $('<tr>', {id: id}).appendTo($('#playerlistbody'));    

    toggletd = $('<td>').appendTo(this.row);
    this.toggle = $('<a>').appendTo(toggletd);
    this.toggleimg = $('<img>', {src: 'img/triangle.svg', class: 'imgbutton'}).appendTo(this.toggle);
    
    this.name = $('<td>').appendTo(this.row);
    this.team = $('<td>').appendTo(this.row);
    this.connected = $('<td>').appendTo(this.row);
    this.power = $('<td>').appendTo(this.row);
    this.id = $('<td>').appendTo(this.row);
        
    this.settingsrow = $('<tr>').appendTo($('#playerlistbody'));
    this.toggle.click(function(e) {
        if (!me.settingsdiv.hasClass('collapsed')) {
            me.settingsdiv.addClass('collapsed');
            me.toggleimg.removeClass('rotated');
        }
        
        else {
            $('.playersettings').addClass('collapsed');
            $('.imgbutton').removeClass('rotated');
            me.settingsdiv.removeClass('collapsed');
            me.toggleimg.addClass('rotated');
        }
    });
    
    this.settingstd = $('<td>', {colspan: 5}).appendTo(this.settingsrow);
    this.settingsdiv = $('<div>', {class: 'playersettings collapsed'}).appendTo(this.settingstd);
    $('<h1>', {text: 'BLAH!'}).appendTo(this.settingsdiv);     

    this.togglesettings = function (event) {alert(event); this.settingsrow.slideToggle();}
    
    this.update = function (playerdata) {
        if (playerdata.connected !== undefined) {
            if (playerdata.connected) {playerdata.connected = 'Connected';}
            else {playerdata.connected = 'Disconnected';}
        }
        for (prop in playerdata) {
            if (this[prop] !== undefined) {
                this[prop].text(playerdata[prop]);
            }
        }
    }
}

function handlemessage(event) {
    data = JSON.parse(event.data);
    
    if (data.game !== undefined) {
        if (data.game.state !== undefined) {
            gamestate = data.game.state;
            $('#gamestate').text(data.game.state);
        }
        if (data.game.mode !== undefined) {
            $('#gamemode').text(data.game.mode);
        }
    }
    
    else if (data.player !== undefined) {
        var player = players[data.player.id];
        if (player === undefined) {
            player = new Player();
            players[data.player.id] = player;
        }

        player.update(data.player);
    }
}

function sendevent(event) {
    websocket.send(JSON.stringify(event));
}

var gamesettings_state = false
function togglesettings() {
    if (!gamesettings_state) {
        $('#gamesettings').addClass('expand');
        gamesettings_state = true;
    }
    
    else {
        $('#gamesettings').removeClass('expand');
        gamesettings_state = false;
    }
}

function startstopclicked() {
    if (gamestate == 'not playing') {
        sendevent({'game': {
            'state': 'starting'
        }});
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
    $('#main').addClass('connected');
}

//TODO write connection error handle code
